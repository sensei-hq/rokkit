# fix-tooltip-xss-sink — acceptance

## Given a tooltip over untrusted data

- **Given** a bar chart with `tooltip` enabled and a row whose value
  contains `<img src=x onerror=alert(1)>`
- **When** the user hovers the bar in Chromium
- **Then** no script executes and the value renders as inert text

## Given pre-escaped entity input

- **Given** a row value containing `&amp;`
- **When** the tooltip renders
- **Then** the cell shows `&` exactly once (no double-escaping)
