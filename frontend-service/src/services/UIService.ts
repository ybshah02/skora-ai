class UIService {
    static instance;
    callbacks = {};

    constructor() {
        if (UIService.instance) {
            return UIService.instance;
        }
        UIService.instance = this;
    }

    // Register a callback with a specific name
    register(name, callback) {
        this.callbacks[name] = callback;
    }

    // Unregister a callback by name
    unregister(name) {
        delete this.callbacks[name];
    }

    // Trigger an update to a specific callback by name
    update(name, value) {
        if (this.callbacks[name]) {
            console.log("callback with:" + value)
            this.callbacks[name](value);
        }
    }
}

// Export as a singleton
const uiService = new UIService();
export default uiService;
