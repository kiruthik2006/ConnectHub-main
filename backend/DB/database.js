import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectedDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URL ||
      "mongodb+srv://arunpravin125_db_user:ffmb0mlrMWvdEbWl@cluster0.n3d9lkp.mongodb.net/social?appName=Cluster0";

    console.log("Attempting to connect to MongoDB...");

    const connect = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 10000, // Connection timeout
    });

    console.log(
      `✅ MongoDB connected successfully: ${connect.connection.host}`
    );
    console.log(`📊 Database: ${connect.connection.name}`);

    // Initialize GridFS for video storage
    const Grid = (await import("gridfs-stream")).default;
    const gfs = Grid(connect.connection.db, mongoose.mongo);
    gfs.collection("videos");
    console.log(`✅ GridFS initialized for video storage`);
  } catch (error) {
    console.error("\n❌ Error connecting to MongoDB:");
    console.error(`   Error: ${error.message}`);

    if (error.message.includes("ENOTFOUND")) {
      console.error("\n🔍 DNS Resolution Failed - Troubleshooting:");
      console.error("   1. Check your internet connection");
      console.error(
        "   2. Verify MongoDB Atlas cluster is running (not paused)"
      );
      console.error(
        "   3. Check if your IP is whitelisted in MongoDB Atlas Network Access"
      );
      console.error("   4. Try disabling VPN/firewall temporarily");
      console.error(
        "   5. Verify the connection string in MongoDB Atlas dashboard"
      );
      console.error("\n💡 Connection string format:");
      console.error(
        "   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>"
      );
    } else if (error.message.includes("authentication")) {
      console.error("\n🔐 Authentication Failed:");
      console.error("   - Check username and password in connection string");
      console.error("   - Verify database user exists in MongoDB Atlas");
    } else if (error.message.includes("timeout")) {
      console.error("\n⏱️  Connection Timeout:");
      console.error("   - Check network connectivity");
      console.error("   - Verify firewall isn't blocking MongoDB ports");
    }

    // Only exit in production, allow nodemon to handle in development
    if (process.env.NODE_ENV === "production") {
      console.error("\n🚨 Exiting due to MongoDB connection failure...");
      process.exit(1);
    } else {
      console.error(
        "\n⚠️  Server will continue but MongoDB operations will fail"
      );
      console.error("   Fix the connection and restart the server\n");
    }
  }
};
