// NAME: Custom Controls
// AUTHORS: darkthemer, OhItsTom
// DESCRIPTION: Replaces the original buttons with custom minimum, maximum, and close buttons from the titlebar.

(async function customControls() {
    if (!Spicetify.CosmosAsync || !Spicetify.Platform) {
        setTimeout(customControls, 10);
        return;
    }

    await Spicetify.CosmosAsync.post("sp://messages/v1/container/control", {
        type: "update_titlebar",
        height: "1px",
    });

    let config;
    try {
        config = JSON.parse(
            localStorage.getItem("customControls:config") || "{}"
        );
    } catch {
        config = {
            fullscreenMaximize: false,
        };
    }

    function saveConfig() {
        localStorage.setItem("customControls:config", JSON.stringify(config));
    }

    const ccSettings = document.createElement("div");
    ccSettings.id = "ccSettings";

    const settingsStyle = document.createElement("style");
    settingsStyle.innerHTML = `
    .setting-row::after {
        content: "";
        display: table;
        clear: both;
    }
    .setting-row + span {
        font-size: 0.825rem;
    }
    .setting-row .col {
        padding: 16px 0 4px;
        align-items: center;
    }
    .setting-row .col.description {
        float: left;
        padding-right: 15px;
        cursor: default;
    }
    .setting-row .col.action {
        float: right;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
    .setting-row .col.action input {
        width: 100%;
        margin-top: 10px;
        padding: 0 5px;
        height: 32px;
        border: 0;
        color: var(--spice-text);
        background-color: initial;
        border-bottom: 1px solid var(--spice-text);
    }
    button.switch {
        align-items: center;
        border: 0px;
        border-radius: 50%;
        background-color: rgba(var(--spice-rgb-shadow), 0.7);
        color: var(--spice-text);
        cursor: pointer;
        margin-inline-start: 12px;
        padding: 8px;
        width: 32px;
        height: 32px;
    }
    button.switch.disabled,
    button.switch[disabled] {
        color: rgba(var(--spice-rgb-text), 0.3);
    }
    button.switch.small {
        width: 22px;
        height: 22px;
        padding: 3px;
    }
    `;
    ccSettings.appendChild(settingsStyle);

    function createButtonSwitch(name, desc, defaultVal, onChange) {
        defaultVal = config[name] ?? defaultVal;
        onChange(defaultVal);

        const ccSettings = document.createElement("div");
        ccSettings.classList.add("setting-row");
        ccSettings.id = name;
        ccSettings.innerHTML = `
        <label class="col description">${desc}</label>
        <div class="col action">
            <button class="switch">
                <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                    ${Spicetify.SVGIcons.check}
                </svg>
            </button>
        </div>
        `;

        const buttonSwitch = ccSettings.querySelector("button.switch");
        buttonSwitch.classList.toggle("disabled", !defaultVal);

        buttonSwitch.onclick = () => {
            const state = buttonSwitch.classList.contains("disabled");
            buttonSwitch.classList.toggle("disabled");
            config[name] = state;
            saveConfig();
            onChange(state);
            console.log(config);
        };

        return ccSettings;
    }

    const titlebar = document.createElement("div");
    titlebar.id = "customControls";
    titlebar.innerHTML = `
    <div class="ctrls">
        <div class="ctrl min"><div class="icon"></div></div>
        <div class="ctrl max"><div class="icon"></div></div>
        <div class="ctrl close"><div class="icon"></div></div>
    </div>
    `;
    document.getElementById("main").appendChild(titlebar);

    const style = document.createElement("style");
    style.id = "customControls_style";
    style.innerHTML = `
    @import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);
    
    :root {
        --control-button-width: 60px;
        --control-button-height: 52px;

        --control-button-bg-color: transparent;
        --control-button-icon-color: var(--spice-text);
        --control-button-bg-hover-color: rgba(var(--spice-rgb-selected-row),.1);
        --control-button-icon-hover-color: var(--spice-text);
        --close-button-bg-hover-color: rgba(var(--spice-rgb-notification-error),.1);
        --close-button-icon-hover-color: var(--spice-text);

        --min-button-order: 1;
        --max-button-order: 2;
        --close-button-order: 3;

        --control-button-icon-weight: 300;
        --control-button-icon-size: 24px;
    }
    .spotify__container--is-desktop:not(.fullscreen).spotify__os--is-windows .body-drag-top {
        right: calc(var(--control-button-width) * 3);
    }
    .ctrls {
        display: flex;
        flex-direction: row;
        position: absolute;
        top: 0;
        right: 0;
        width: auto;
        height: auto;
        z-index: 1;
    }
    .ctrl {
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--control-button-width);
        height: var(--control-button-height);
        background-color: var(--control-button-bg-color);
        color: var(--control-button-icon-color);
    }
    .min {
        order: var(--min-button-order);
    }
    .max {
        order: var(--max-button-order);
    }
    .close {
        order: var(--close-button-order);
    }
    .ctrl:hover {
        background-color: var(--control-button-bg-hover-color);
        color: var(--control-button-icon-hover-color);
    }
    .close:hover {
        background-color: var(--close-button-bg-hover-color) !important;
        color: var(--close-button-icon-hover-color) !important;
    }
    .icon::before {
        font-family: 'Material Symbols Outlined';
        font-weight: var(--control-button-icon-weight);
        font-style: normal;
        font-size: var(--control-button-icon-size);
        line-height: 1.5;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
    }
    .min .icon::before {
        content: 'horizontal_rule';
    }
    .max .icon::before {
        content: 'crop_7_5';
    }
    .close .icon::before {
        content: 'close';
    }
    `;
    document.head.appendChild(style);

    const min = titlebar.querySelector(".min");
    min.onclick = function minAction() {
        alert(
            "[customControls extension]\nMinimizing the window is not possible due to limitations.\n\nPress Win+Down to minimize."
        );
    };

    ccSettings.appendChild(
        createButtonSwitch(
            "fullscreenMaximize",
            "Clicking maximize triggers fullscreen instead",
            false,
            (state) => {
                if (state) {
                    maximizeMethod = "fullscreen";
                } else {
                    maximizeMethod = "resize";
                }
            }
        )
    );

    const max = titlebar.querySelector(".max");
    max.onclick = function maxAction() {
        switch (maximizeMethod) {
            case "fullscreen":
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                break;
            case "resize":
                if (
                    window.outerHeight < screen.availHeight ||
                    window.outerWidth < screen.availWidth
                ) {
                    localStorage.setItem("prevWinW", window.outerWidth);
                    localStorage.setItem("prevWinH", window.outerHeight);
                    localStorage.setItem("prevWinX", window.screenX);
                    localStorage.setItem("prevWinY", window.screenY);
                    window.moveTo(0, 0);
                    window.resizeTo(screen.availWidth, screen.availHeight);
                } else if (
                    window.outerHeight == screen.availHeight ||
                    window.outerWidth == screen.availWidth
                ) {
                    let prevWidth = localStorage.getItem("prevWinW");
                    let prevHeight = localStorage.getItem("prevWinH");
                    let prevX = localStorage.getItem("prevWinX");
                    let prevY = localStorage.getItem("prevWinY");
                    window.resizeTo(prevWidth, prevHeight);
                    window.moveTo(prevX, prevY);
                }
                break;
        }
    };

    const close = titlebar.querySelector(".close");
    close.onclick = function closeAction() {
        window.close();
    };

    new Spicetify.Menu.Item("Custom Controls", false, () => {
        Spicetify.PopupModal.display({
            title: "Custom Controls",
            content: ccSettings,
            isLarge: true,
        });
    }).register();
})();
