# Tweeter-Web

A starter project for the Tweeter Web application.

## High-Performance Feed Fan-Out Architecture

To support users with 10,000+ followers, I implemented an asynchronous fan-out-on-write system using AWS Lambda, SQS, and DynamoDB. This keeps posting fast (<1s) while still updating all follower feeds within the required 120 seconds.

### Architecture Overview

When a user posts a status:

1. **PostHandler (Lambda)**

   - Saves the status to the author’s story table
   - Pushes a message into **PostQ (SQS)**
   - Immediately returns “Successfully Posted!” (<1s latency)

2. **FollowFetcher (Lambda)**

   - Triggered by PostQ
   - Retrieves all followers (10K+ supported)
   - Splits them into batches of ~25
   - Enqueues each batch into **JobQ (SQS)**

3. **JobHandler (Lambda)**
   - Triggered per batch from JobQ
   - Writes the status into each follower’s feed (fan-out)
   - Hundreds of Lambdas run in parallel, completing feed updates in <60s

### Performance Notes

- Tested with **10,000 generated users** and a user with **10,000 followers**
- Temporary WCUs increased to 200 for batch loading, then returned to normal
- Feed reads remain <200ms because feeds are precomputed at write-time
- Overall system meets all latency and scalability requirements

This design mirrors real social-network architectures and allows Tweeter to scale horizontally without managing any servers.

## Setting Up the Project

1. cd into the project root folder
1. Run 'npm install'
1. cd into the tweeter-shared folder
1. Run 'npm install'
1. Run 'npm run build'
1. cd into the tweeter-web folder
1. Run 'npm install'
1. Run 'npm run build'

**Note:** VS Code seems to have a bug. After doing this, you should be able to run the project but code editors report that they can't see the 'tweeter-shared' module. Restarting VS Code fixes the problem. You will likely need to restart VS Code every time you compile or build the 'tweeter-shared' module.

**Note:** If you are using Windows, make sure to use a Git Bash terminal instead of Windows Powershell. Otherwise, the scripts won't run properly in tweeter-shared and it will cause errors when building tweeter-web.

## Rebuilding the Project

Rebuild either module of the project (tweeter-shared or tweeter-web) by running 'npm run build' after making any code or configuration changes in the module. The 'tweeter-web' module is dependent on 'tweeter-shared', so if you change 'tweeter-shared' you will also need to rebuild 'tweeter-web'. After rebuilding 'tweeter-shared' you will likely need to restart VS Code (see note above under 'Setting Up the Project').

## Running the Project

Run the project by running 'npm start' from within the 'tweeter-web' folder.
