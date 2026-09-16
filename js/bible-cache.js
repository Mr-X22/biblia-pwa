// bible-cache.js
// Guarda la Biblia en IndexedDB para poder utilizarla sin conexión.

const bibleCache = {

    DB_NAME: "BibliaPWA",
    STORE_NAME: "bible",
    KEY: "rvr1960",

    async open() {
        return new Promise((resolve, reject) => {

            const request = indexedDB.open(this.DB_NAME, 1);

            request.onupgradeneeded = event => {

                const db = event.target.result;

                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, {
                        keyPath: "id"
                    });
                }
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    },

    async get() {

        try {

            const db = await this.open();

            return new Promise((resolve, reject) => {

                const transaction = db.transaction(
                    this.STORE_NAME,
                    "readonly"
                );

                const store = transaction.objectStore(
                    this.STORE_NAME
                );

                const request = store.get(this.KEY);

                request.onsuccess = () => {
                    resolve(request.result || null);
                };

                request.onerror = () => {
                    reject(request.error);
                };
            });

        } catch (error) {

            console.warn(
                "No se pudo leer la Biblia desde IndexedDB:",
                error
            );

            return null;
        }
    },

    async set(data) {

        try {

            const db = await this.open();

            return new Promise((resolve, reject) => {

                const transaction = db.transaction(
                    this.STORE_NAME,
                    "readwrite"
                );

                const store = transaction.objectStore(
                    this.STORE_NAME
                );

                store.put({
                    id: this.KEY,
                    ...data
                });

                transaction.oncomplete = () => {
                    resolve(true);
                };

                transaction.onerror = () => {
                    reject(transaction.error);
                };
            });

        } catch (error) {

            console.warn(
                "No se pudo guardar la Biblia en IndexedDB:",
                error
            );

            return false;
        }
    },

    async clear() {

        try {

            const db = await this.open();

            return new Promise((resolve, reject) => {

                const transaction = db.transaction(
                    this.STORE_NAME,
                    "readwrite"
                );

                const store = transaction.objectStore(
                    this.STORE_NAME
                );

                const request = store.delete(this.KEY);

                request.onsuccess = () => {
                    resolve(true);
                };

                request.onerror = () => {
                    reject(request.error);
                };
            });

        } catch (error) {

            console.warn(
                "No se pudo borrar la Biblia de IndexedDB:",
                error
            );

            return false;
        }
    }
};