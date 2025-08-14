import mongoose from "mongoose"
import { GridFSBucket } from "mongodb"

let gfs
let gridfsBucket

const conn = mongoose.connection

conn.once("open", () => {
  gridfsBucket = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  })

  gfs = gridfsBucket
  console.log("✅ GridFS initialized")
})

export { gfs, gridfsBucket }
