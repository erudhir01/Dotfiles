# Dotfiles

A collection of configuration files (dotfiles) for various Linux applications, window managers, and development tools, primarily focused on an Arch Linux environment.

## Repository Structure

The repository is organized by application name. Each directory typically follows the structure of the user's $HOME directory, making it easier to manage and symlink.

### Window Managers & Compositors
- **[AwesomeWM](awesome/)**: Lua-based tiling window manager configuration.
- **[Hyprland](hypr/)**: Dynamic tiling Wayland compositor with a focus on aesthetics.
- **[i3wm](i3/)**: Classic manual tiling window manager for X11.
- **[Qtile](qtile/)**: A full-featured, hackable tiling window manager written and configured in Python.
- **[Sway](sway/)**: Tiling Wayland compositor and a drop-in replacement for the i3 window manager.

### Terminals & Shells
- **[Alacritty](alacritty/)**: A cross-platform, GPU-accelerated terminal emulator.
- **[Ghostty](ghostty/)**: A fast, feature-rich terminal emulator.
- **[Kitty](kitty/)**: A modern, feature-rich, GPU-based terminal emulator.
- **[WezTerm](wezterm/)**: A powerful GPU-accelerated cross-platform terminal emulator and multiplexer.
- **[Zsh](zsh/)**: Shell configuration including `.zshrc` and `.zprofile`.
- **[Tmux](tmux/)**: Terminal multiplexer configuration.
- **[Zellij](zellij/)**: A modern terminal workspace and multiplexer.
- **[Starship](starship/)**: The minimal, blazing-fast, and infinitely customizable prompt for any shell.

### Editors
- **[Neovim](nvim/)**: Extensible Vim-based text editor configuration (Lua-based).
- **[VS Code](vscode/)** & **[VSCodium](VSCodium/)**: Settings and keybindings for Visual Studio Code and its telemetry-free binary.
- **[Zed](zed/)**: High-performance, multiplayer code editor.

### Utilities & System
- **[Waybar](waybar/)** / **[Polybar](polybar/)**: Status bars for Wayland and X11 environments.
- **[Rofi](rofi/)** / **[Wofi](wofi/)** / **[Fuzzel](fuzzel/)**: Application launchers and menu systems.
- **[Dunst](dunst/)** / **[Mako](mako/)**: Notification daemons for X11 and Wayland.
- **[Scripts](scripts/)**: A collection of utility scripts for system management (volume, brightness, wifi, power menu, etc.).
- **[Picom](picom/)**: A lightweight compositor for X11.
- **[Kanata](kanata/)**: A software keyboard remapper.
- **[Yazi](yazi/)**: Blazing fast terminal file manager.
- **[Swaylock](swaylock/)** / **[Betterlockscreen](betterlockscreen/)**: Screen locking utilities.

## Getting Started

### Prerequisites
Most of these configurations are designed for **Arch Linux**. The included installation scripts (`scripts/scripts/archsetup.sh`) use `pacman` and `yay` to install dependencies.

### Installation
The repository is structured to be used with a symlinking tool like [GNU Stow](https://www.gnu.org/software/stow/) or manual symlinks.

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dotfiles.git ~/dotfiles
   cd ~/dotfiles
   ```

2. (Optional) Run the setup script to install dependencies:
   ```bash
   chmod +x scripts/scripts/archsetup.sh
   ./scripts/scripts/archsetup.sh
   ```

## License
Refer to the individual configuration files for specific licensing information where applicable.
