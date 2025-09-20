// Client-side Socket Manager for Multiplayer Game
class ClientSocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.playerId = null;
        this.roomId = null;
        this.eventHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    // Initialize connection to server
    connect(serverUrl = 'http://localhost:3000') {
        try {
            this.socket = io(serverUrl);
            this.setupEventListeners();
            console.log('Connecting to server...');
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.handleConnectionError();
        }
    }

    setupEventListeners() {
        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.connected = true;
            this.reconnectAttempts = 0;
            this.emit('connected');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from server:', reason);
            this.connected = false;
            this.emit('disconnected', reason);
            
            if (reason === 'io server disconnect') {
                // Server initiated disconnect, try to reconnect
                this.attemptReconnect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.handleConnectionError();
        });

        // Game events
        this.socket.on('player_data', (data) => {
            console.log('Received player data:', data);
            this.playerId = data.id;
            this.roomId = data.roomId;
            this.emit('player_data', data);
        });

        this.socket.on('command_result', (result) => {
            console.log('Command result:', result);
            this.emit('command_result', result);
        });

        this.socket.on('command_error', (error) => {
            console.error('Command error:', error);
            this.emit('command_error', error);
        });

        this.socket.on('player_joined', (data) => {
            console.log('Player joined:', data);
            this.emit('player_joined', data);
        });

        this.socket.on('player_left', (data) => {
            console.log('Player left:', data);
            this.emit('player_left', data);
        });

        this.socket.on('player_moved', (data) => {
            this.emit('player_moved', data);
        });

        this.socket.on('player_state_update', (data) => {
            this.emit('player_state_update', data);
        });

        this.socket.on('player_companion_update', (data) => {
            console.log('Player companion update:', data);
            this.emit('player_companion_update', data);
        });

        this.socket.on('player_quest_update', (data) => {
            console.log('Player quest update:', data);
            this.emit('player_quest_update', data);
        });

        this.socket.on('player_guild_update', (data) => {
            console.log('Player guild update:', data);
            this.emit('player_guild_update', data);
        });

        this.socket.on('room_players', (players) => {
            console.log('Room players:', players);
            this.emit('room_players', players);
        });

        this.socket.on('room_state_update', (state) => {
            this.emit('room_state_update', state);
        });

        this.socket.on('chat_message', (data) => {
            this.emit('chat_message', data);
        });

        this.socket.on('error', (error) => {
            console.error('Server error:', error);
            this.emit('error', error);
        });
    }

    // Event system
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error('Error in event handler:', error);
                }
            });
        }
    }

    // Player actions
    joinGame(playerData) {
        if (!this.connected) {
            console.error('Not connected to server');
            return false;
        }

        this.socket.emit('player_join', playerData);
        return true;
    }

    sendCommand(command, data) {
        if (!this.connected) {
            console.error('Not connected to server');
            return false;
        }

        this.socket.emit('player_command', {
            command: command,
            data: data,
            timestamp: Date.now()
        });
        return true;
    }

    movePlayer(position) {
        if (!this.connected) {
            console.error('Not connected to server');
            return false;
        }

        this.socket.emit('player_move', position);
        return true;
    }

    sendChatMessage(message) {
        if (!this.connected) {
            console.error('Not connected to server');
            return false;
        }

        this.socket.emit('chat_message', message);
        return true;
    }

    // Game commands
    useItem(itemId) {
        return this.sendCommand('use_item', { itemId });
    }

    cultivate(duration) {
        return this.sendCommand('cultivate', { duration });
    }

    feedPet(foodType) {
        return this.sendCommand('feed_pet', { foodType });
    }

    giveGift(giftId) {
        return this.sendCommand('give_gift', { giftId });
    }

    obtainPet(petId) {
        return this.sendCommand('obtain_pet', { petId });
    }

    obtainWife(wifeId) {
        return this.sendCommand('obtain_wife', { wifeId });
    }

    acceptQuest(questId) {
        return this.sendCommand('accept_quest', { questId });
    }

    completeQuest(questId) {
        return this.sendCommand('complete_quest', { questId });
    }

    joinGuild(guildId) {
        return this.sendCommand('join_guild', { guildId });
    }

    contributeGuild(goldAmount, spiritStonesAmount) {
        return this.sendCommand('contribute_guild', { goldAmount, spiritStonesAmount });
    }

    purchasePremiumItem(itemId) {
        return this.sendCommand('purchase_premium', { itemId });
    }

    adminAddKNB(amount) {
        return this.sendCommand('admin_add_knb', { amount });
    }

    // Connection management
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.connected = false;
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.socket.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            this.emit('reconnect_failed');
        }
    }

    handleConnectionError() {
        this.connected = false;
        this.emit('connection_error');
    }

    // Utility methods
    isConnected() {
        return this.connected && this.socket && this.socket.connected;
    }

    getPlayerId() {
        return this.playerId;
    }

    getRoomId() {
        return this.roomId;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClientSocketManager;
} else if (typeof window !== 'undefined') {
    window.ClientSocketManager = ClientSocketManager;
}
