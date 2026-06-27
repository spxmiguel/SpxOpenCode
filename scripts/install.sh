#!/usr/bin/env bash
set -euo pipefail

# SpxOpenCode Installer
#
# NOTE: SpxOpenCode has no published binaries yet. This script installs
# from source using git + bun. When binary releases are available this
# script will offer a faster download path automatically.

MUTED='\033[0;2m'
RED='\033[0;31m'
ORANGE='\033[38;5;214m'
GREEN='\033[0;32m'
NC='\033[0m'

REPO="https://github.com/spxmiguel/SpxOpenCode.git"
INSTALL_DIR="$HOME/.spxopencode"
BIN_DIR="$INSTALL_DIR/bin"
SRC_DIR="$INSTALL_DIR/src"

usage() {
    cat <<EOF
SpxOpenCode Installer (alpha)

Usage: install.sh [options]

Options:
    -h, --help           Display this help message
        --no-modify-path Don't modify shell config files

Examples:
    curl -fsSL https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.sh | bash
    curl -fsSL https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.sh | bash -s -- --no-modify-path

Alpha notice: no compiled binaries are published yet. Installs from source.
Requires: git. bun is auto-installed if missing (via brew on macOS, or bun.sh installer).
EOF
}

no_modify_path=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            usage
            exit 0
            ;;
        --no-modify-path)
            no_modify_path=true
            shift
            ;;
        *)
            echo -e "${ORANGE}Warning: unknown option '$1'${NC}" >&2
            shift
            ;;
    esac
done

echo -e ""
echo -e "${ORANGE}⚠  SpxOpenCode is in alpha — expect breaking changes.${NC}"
echo -e ""

# Auto-install bun if missing
if ! command -v bun >/dev/null 2>&1; then
    echo -e "${ORANGE}bun not found — installing...${NC}"
    if [[ "$(uname)" == "Darwin" ]] && command -v brew >/dev/null 2>&1; then
        brew install oven-sh/bun/bun
    else
        curl -fsSL https://bun.sh/install | bash
        export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
        export PATH="$BUN_INSTALL/bin:$PATH"
    fi
    if ! command -v bun >/dev/null 2>&1; then
        echo -e "${RED}Error: bun install failed. Install manually: https://bun.sh${NC}"
        exit 1
    fi
    echo -e "${GREEN}bun installed.${NC}"
fi

# Dependency checks
if ! command -v git >/dev/null 2>&1; then
    echo -e "${RED}Error: 'git' is required but not installed.${NC}"
    exit 1
fi

mkdir -p "$BIN_DIR"

# Clone or update source
if [[ -d "$SRC_DIR/.git" ]]; then
    echo -e "${MUTED}Updating SpxOpenCode source...${NC}"
    git -C "$SRC_DIR" pull --ff-only --quiet
else
    echo -e "${MUTED}Cloning SpxOpenCode...${NC}"
    git clone --depth 1 --quiet "$REPO" "$SRC_DIR"
fi

# Install dependencies
echo -e "${MUTED}Installing dependencies...${NC}"
(cd "$SRC_DIR" && bun install --frozen-lockfile --silent)

# Create wrapper script for spxopencode
WRAPPER="$BIN_DIR/spxopencode"
cat > "$WRAPPER" <<WRAPPER_EOF
#!/usr/bin/env bash
exec bun run --conditions=browser "$SRC_DIR/packages/opencode/src/index.ts" "\$@"
WRAPPER_EOF
chmod 755 "$WRAPPER"

# Optional spx alias
SPX_ALIAS="$BIN_DIR/spx"
ln -sf "$WRAPPER" "$SPX_ALIAS"

# PATH management
add_to_path() {
    local config_file=$1
    local command=$2

    if grep -Fq "$BIN_DIR" "$config_file" 2>/dev/null; then
        echo -e "${MUTED}PATH already contains $BIN_DIR in $config_file, skipping.${NC}"
    elif [[ -w "$config_file" ]]; then
        echo -e "\n# spxopencode" >> "$config_file"
        echo "$command" >> "$config_file"
        echo -e "${MUTED}Added $BIN_DIR to PATH in $config_file${NC}"
    else
        echo -e "${ORANGE}Could not write to $config_file. Add manually:${NC}"
        echo -e "  $command"
    fi
}

if [[ "$no_modify_path" != "true" ]]; then
    XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
    current_shell=$(basename "${SHELL:-bash}")

    case "$current_shell" in
        fish)
            config_files="$HOME/.config/fish/config.fish"
            ;;
        zsh)
            config_files="${ZDOTDIR:-$HOME}/.zshrc ${ZDOTDIR:-$HOME}/.zshenv $XDG_CONFIG_HOME/zsh/.zshrc $XDG_CONFIG_HOME/zsh/.zshenv"
            ;;
        bash)
            config_files="$HOME/.bashrc $HOME/.bash_profile $HOME/.profile $XDG_CONFIG_HOME/bash/.bashrc $XDG_CONFIG_HOME/bash/.bash_profile"
            ;;
        *)
            config_files="$HOME/.bashrc $HOME/.bash_profile $HOME/.profile"
            ;;
    esac

    if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
        config_file=""
        for f in $config_files; do
            if [[ -f "$f" ]]; then
                config_file="$f"
                break
            fi
        done

        if [[ -z "$config_file" ]]; then
            echo -e "${ORANGE}No shell config found. Add manually:${NC}"
            echo -e "  export PATH=\"$BIN_DIR:\$PATH\""
        else
            case "$current_shell" in
                fish)
                    add_to_path "$config_file" "fish_add_path $BIN_DIR"
                    ;;
                *)
                    add_to_path "$config_file" "export PATH=\"$BIN_DIR:\$PATH\""
                    ;;
            esac
        fi
    fi
fi

if [ -n "${GITHUB_ACTIONS-}" ] && [ "${GITHUB_ACTIONS}" = "true" ]; then
    echo "$BIN_DIR" >> "$GITHUB_PATH"
fi

echo -e ""
echo -e "${GREEN}SpxOpenCode installed.${NC}"
echo -e ""
echo -e "  ${MUTED}Command:${NC}  spxopencode"
echo -e "  ${MUTED}Alias:${NC}    spx"
echo -e "  ${MUTED}Source:${NC}   $SRC_DIR"
echo -e "  ${MUTED}Bin:${NC}      $BIN_DIR"
echo -e ""
echo -e "${MUTED}Restart your shell or run:${NC}"
echo -e "  export PATH=\"$BIN_DIR:\$PATH\""
echo -e ""
echo -e "${MUTED}To update:${NC}"
echo -e "  curl -fsSL https://raw.githubusercontent.com/spxmiguel/SpxOpenCode/main/scripts/install.sh | bash"
echo -e ""
echo -e "${MUTED}To uninstall:${NC}"
echo -e "  rm -rf $INSTALL_DIR"
echo -e ""
