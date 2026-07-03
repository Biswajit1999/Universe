// Keep the personal server on this PC. Next's standalone server otherwise
// binds to every network interface by default.
process.env.HOSTNAME = process.env.HOSTNAME || "127.0.0.1";
process.env.PORT = process.env.PORT || "3000";
process.env.NODE_ENV = "production";

require("../.next/standalone/server.js");
