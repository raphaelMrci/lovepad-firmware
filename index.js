var admin = require("firebase-admin");

const https = require("https");
const options = {
    hostname: "https://lovepad-server.herokuapp.com/",
    port: 5000,
    path: "/",
    method: "GET",
};

var serviceAccount = require("./lovepad-860c7-firebase-adminsdk-wvev3-6ccca651eb.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
        "https://lovepad-860c7-default-rtdb.europe-west1.firebasedatabase.app",
});

const Launchpad = require("launchpad-mini"),
    pad = new Launchpad();

let sended = false,
    selectedID = 0;

pad.connect().then(() => {
    // Auto-detect Launchpad
    pad.col(pad.red.full, [8, 0]);
    pad.col(pad.green.low, [8, 1]);
    pad.col(pad.amber.low, [8, 2]);
    pad.col(pad.yellow.low, [8, 3]);

    pad.on("key", (k) => {
        if (k.x == 8) {
            switch (k.y) {
                case 0:
                    pad.col(pad.red.full, [8, 0]);
                    pad.col(pad.green.low, [8, 1]);
                    pad.col(pad.amber.low, [8, 2]);
                    pad.col(pad.yellow.low, [8, 3]);
                    selectedID = 0;
                    break;
                case 1:
                    pad.col(pad.red.low, [8, 0]);
                    pad.col(pad.green.full, [8, 1]);
                    pad.col(pad.amber.low, [8, 2]);
                    pad.col(pad.yellow.low, [8, 3]);
                    selectedID = 1;
                    break;
                case 2:
                    pad.col(pad.red.low, [8, 0]);
                    pad.col(pad.green.low, [8, 1]);
                    pad.col(pad.amber.full, [8, 2]);
                    pad.col(pad.yellow.low, [8, 3]);
                    selectedID = 2;
                    break;
                case 3:
                    pad.col(pad.red.low, [8, 0]);
                    pad.col(pad.green.low, [8, 1]);
                    pad.col(pad.amber.low, [8, 2]);
                    pad.col(pad.yellow.full, [8, 3]);
                    selectedID = 3;
                    break;
            }
            return;
        }
        if (!sended) {
            sendSMS();
            sended = true;
        }

        if (pad.pressedButtons.length == 0) sended = false;
    });
});

function getReq() {
    return new Promise((resolve, reject) => {
        https
            .get("https://lovepad-server.herokuapp.com/", (resp) => {
                let data = "";

                // A chunk of data has been received.
                resp.on("data", (chunk) => {
                    resolve();
                });
            })
            .on("error", (err) => {
                reject(err);
            });
    });
}

function saveData(id, callback) {
    admin
        .database()
        .ref(id + "/value")
        .set({ state: true });

    callback(null);
}

async function sendSMS() {
    sendedAnimation();
    require("dns").resolve("www.google.com", function (err) {
        if (err) {
            console.log("No connection");
            return;
        } else {
            console.log("Connected");

            getReq()
                .then(() => {
                    saveData(selectedID, function (err) {
                        if (err) {
                            console.error(err);
                            return;
                        }

                        console.log("SMS sent successfully");
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    });
}

async function sendedAnimation() {
    pad.col(pad.red.off, Launchpad.Buttons.Grid);
    pad.col(
        pad.red.full,
        pad.fromMap(
            "-xx--xx-o" +
                "xxxxxxxxo" +
                "xxxxxxxxo" +
                "xxxxxxxxo" +
                "-xxxxxx-o" +
                "-xxxxxx-o" +
                "--xxxx--o" +
                "---xx---o" +
                "oooooooo "
        )
    );

    await sleep(2000);
    pad.col(pad.red.off, Launchpad.Buttons.Grid);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
