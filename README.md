# Mastodon Integration for Firebot

This script is an extension for [Firebot](https://firebot.app) that allows posting from Firebot, as well as events for Follows, Likes, Boosts, Replies and Mentions.

### Setup

- In your Mastodon instance, go to Preferences > Development
  - Create a new Application
  - The name/website doesn't matter, can just put "Firebot" and "https://firebot.app" or whatever you want
  - Keep the Redirect address the default value
  - Copy the resulting `accessToken` that is provided
- In Firebot, go to Settings > Scripts
  - Enable Custom Scripts if they are not currently enabled
  - Click Manage Startup Scripts
  - Click Add New Script
  - Click the "scripts folder" link to open the Scripts Folder and place oceanityMastodonIntegration.js there
  - Refresh the list of scripts and pick oceanityMastodonIntegration.js from the dropdown
  - In Client Id and Client Secret fields, copy in the two codes from earlier
- Go to Settings > Integrations and click Configure next to Mastodon (by Oceanity)
  - Fill out the instance name without `https://`, eg. `mastodon.social` and the `accessToken` value from earlier
  - Click Save, and you should be connected to Mastodon

### Error Checking

- If you have followed the previous steps and the Post to Mastodon or Events seem to not be working, press `Ctrl + Shift + i` or from the top menu, click Tools > Toggle Developer Tools and make sure `Console` in the window that appears is highlighted
- If you see a `401` error code, it is likely that your `accessToken` is incorrect, and may either have extraneous spaces/characters that are breaking it, or may have been the wrong value from the Application Details
- If you see a `404` error code, it is likely the instance name is incorrect
