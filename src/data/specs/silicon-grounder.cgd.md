## Problem Statement & Background

Conventional desktop GUI automation on macOS relies on taking over the physical display and hardware mouse cursor. This interrupts developer productivity, causes recursive visual feedback loops when an IDE is captured, and breaks pair programming when agents flash modals or steal window focus. Developers require true background OS automation that runs concurrently without visual occlusion or cursor theft.

## Personal Role & Delivery Capacity

Sole author and systems architect (`sirsahol`). Conceived, designed, and implemented the virtual display coexistence architecture, macOS accessibility (`AXUIElement`) direct-action driver, sub-5ms cursor warp-and-restore mechanism, and idle memory teardown policies.

## Core Technical Constraints & Architectural Decisions

- **Single-Device Coexistence Sandbox**: Implemented dynamic provisioning of a headless 1080p virtual canvas (`AgentDisplay`) via BetterDisplay CLI, routing autonomous agent interactions entirely off the physical monitor.
- **AX-First Input Model**: Prefers direct Accessibility Tree API events over raw coordinate clicking, allowing background elements to be targeted without moving the hardware cursor.
- **Sub-5ms Cursor Warp-and-Restore**: For coordinates requiring visual mouse clicks, the engine records user coordinates on Display 1, executes the action on Display 2, and restores user cursor state within 5ms.
- **Aggressive Hex Memory Discipline**: Automatically unloads local vision-language models after 45 seconds of inactivity and destroys the virtual display after 60 seconds, resetting idle memory consumption to zero.

## Delivered System Topology & Technologies

Dual-display coexistence architecture with isolated virtual execution:



- **Runtime Technologies**: Python 3.10+, PyObjC (`Cocoa`, `Quartz`, `ApplicationServices`), FastMCP, BetterDisplay CLI, Pillow (WebP optimization).
- **Client Integration**: Plugs into Antigravity, Claude Desktop, Cursor, and OpenCode via standard MCP config.
