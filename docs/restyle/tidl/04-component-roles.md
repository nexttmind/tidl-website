> Archive. 2024 rebuild capture. Do not implement type, color, or surface from this file. Live tokens: `web/app/globals.css`. Current principles: `13-target-principles.md`.

# Component roles (source)

| Role | Kind | States seen | Notes |
| --- | --- | --- | --- |
| Button/Primary | atom | default, hover | Add to cabinet |
| Button/Filter | atom | default | Opens filter UI |
| Link/Nav | atom | default | Primary nav |
| Link/Subcategory | molecule | default | Thumb + label |
| Card/Product | molecule | default, loading | Loading skeletons on source |
| Input/Search | atom | default | Header search |
| Icon/Utility | atom | | Cart, store, menu, chat |
| Overlay/Cookie | organism | | CMP — ignore in rebuild |
| Overlay/Chat | molecule | floating | Consultant toast + FAB — defer |
| Menu/Mobile | organism | open/closed | Hamburger — DS gap |
| Menu/Mega | organism | collapsed/expanded | Desktop nav buttons — defer |
