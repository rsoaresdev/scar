import client from "./client/client.js";

process.on("unhandledRejection", (reason) => {
 client.debugger("error", reason);
});

process.on("uncaughtException", (error) => {
 client.debugger("error", error);
});
