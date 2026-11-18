# ratelimit-chat-interpret — acceptance

## Given a burst from one client

- **Given** more requests than the limit from one client inside the window
- **When** the excess requests arrive
- **Then** they get 429 without reaching the upstream, and earlier
  requests in the window succeed normally

## Given normal demo use

- **Given** conversational-paced requests from one client
- **When** each request arrives
- **Then** none is throttled and behavior matches today
