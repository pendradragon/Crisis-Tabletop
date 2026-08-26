# Security and Data Handling
This file is for anyone deploying, hosting, or extending the project -- not just running it locally. 

# Current (Reference Implementation) Behavior
- The organization profile text a user enters is sent to Anthropic API and held in an **in-memory** session map (located in `enghine/sessionStore.js`) throughout the entire time the application is executing. It is never written to a disk, database, or logs in stored in the code. 
- Sessions vanish on server restart. There is no session presistence, export, or admin viewer. 
- There is no authentication. Anyone who can reach the server can start and view the exercises. This is fine for local/single use; it is **not** meant to be deployed as-is somewhere where multiple untrusted people can reach it. 

# 