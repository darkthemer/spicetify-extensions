// NAME: Custom Controls
// AUTHORS: darkthemer, OhItsTom
// DESCRIPTION: Replaces the titlebar's original minimum, maximum, and close buttons with custom ones.

(async function customControls() {
    if (!Spicetify.CosmosAsync || !Spicetify.Platform || !Spicetify.React) {
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
        config = {};
    }

    /** @type {React} */
    const react = Spicetify.React;
    const { useState, useCallback } = react;

    config.fullscreenMaximize = config.fullscreenMaximize ?? false;
    config.controlsStyle = config.controlsStyle ?? "win";
    localStorage.setItem("customControls:config", JSON.stringify(config));

    const settingsStyle = `
    .setting-row::after {
        content: "";
        display: table;
        clear: both;
    }
    .setting-row + span {
        font-size: 0.825rem;
        color: var(--spice-subtext);
    }
    .setting-row .col {
        padding: 24px 0 4px;
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
    const ButtonSVG = ({ icon, active = true, onClick }) => {
        return react.createElement(
            "button",
            {
                className: "switch" + (active ? "" : " disabled"),
                onClick,
            },
            react.createElement("svg", {
                width: 16,
                height: 16,
                viewBox: "0 0 16 16",
                fill: "currentColor",
                dangerouslySetInnerHTML: {
                    __html: icon,
                },
            })
        );
    };
    const ConfigSlider = ({ name, defaultValue, onChange = (value) => {} }) => {
        const [active, setActive] = useState(defaultValue);

        const toggleState = useCallback(() => {
            const state = !active;
            setActive(state);
            onChange(state);
        }, [active]);

        return react.createElement(
            "div",
            {
                className: "setting-row",
            },
            react.createElement(
                "label",
                {
                    className: "col description",
                },
                name
            ),
            react.createElement(
                "div",
                {
                    className: "col action",
                },
                react.createElement(ButtonSVG, {
                    icon: Spicetify.SVGIcons.check,
                    active,
                    onClick: toggleState,
                })
            )
        );
    };
    const ConfigSelection = ({
        name,
        defaultValue,
        options,
        onChange = (value) => {},
    }) => {
        const [value, setValue] = useState(defaultValue);

        const setValueCallback = useCallback(
            (event) => {
                let value = event.target.value;
                setValue(value);
                onChange(value);
            },
            [value]
        );

        return react.createElement(
            "div",
            {
                className: "setting-row",
            },
            react.createElement(
                "label",
                {
                    className: "col description",
                },
                name
            ),
            react.createElement(
                "div",
                {
                    className: "col action",
                },
                react.createElement(
                    "select",
                    {
                        className: "main-dropDown-dropDown",
                        value,
                        onChange: setValueCallback,
                    },
                    Object.keys(options).map((item) =>
                        react.createElement(
                            "option",
                            {
                                value: item,
                            },
                            options[item]
                        )
                    )
                )
            )
        );
    };
    const OptionList = ({ items, onChange }) => {
        const [_, setItems] = useState(items);
        return items.map((item) => {
            if (!item || (item.when && !item.when())) {
                return;
            }

            const onChangeItem = item.onChange || onChange;

            return react.createElement(
                "div",
                null,
                react.createElement(item.type, {
                    ...item,
                    name: item.desc,
                    defaultValue: config[item.key],
                    onChange: (value) => {
                        onChangeItem(item.key, value);
                        setItems([...items]);
                    },
                }),
                item.info &&
                    react.createElement("span", {
                        dangerouslySetInnerHTML: {
                            __html: item.info,
                        },
                    })
            );
        });
    };

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

    const cssControlStyles = {
        win: `
        @import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);

        :root {
            --control-button-width: 60px;
            --control-button-height: 52px;
            --control-button-size-multiplier: 1;

            --control-button-bg-color: transparent;
            --control-button-icon-color: var(--spice-text);
            --control-button-bg-hover-color: rgba(var(--spice-rgb-selected-row), 0.1);
            --control-button-icon-hover-color: var(--spice-text);
            --close-button-bg-hover-color: rgba(
                var(--spice-rgb-notification-error),
                0.1
            );
            --close-button-icon-hover-color: var(--spice-text);

            --min-button-order: 1;
            --max-button-order: 2;
            --close-button-order: 3;

            --control-button-symbol-weight: 300;
            --control-button-symbol-size: 24px;
        }
        .spotify__container--is-desktop:not(.fullscreen).spotify__os--is-windows
            .body-drag-top {
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
            zoom: var(--control-button-size-multiplier);
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
            font-family: "Material Symbols Outlined";
            font-weight: var(--control-button-symbol-weight);
            font-style: normal;
            font-size: var(--control-button-symbol-size);
            line-height: 2;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
        }
        .min .icon::before {
            content: "horizontal_rule";
        }
        .max .icon::before {
            content: "crop_7_5";
        }
        .close .icon::before {
            content: "close";
        }
        `,
        mac: `
        @import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);

        :root {
            --control-button-width: 60px;
            --control-button-height: 52px;
            --control-button-size-multiplier: 1;

            --control-button-bg-color: transparent;
            --control-button-bg-hover-color: transparent;
            --control-button-symbol-color: transparent;
            --control-button-symbol-hover-color: rgba(0, 0, 0, 0.6);
            --min-button-icon-color: rgba(241, 174, 27);
            --max-button-icon-color: rgba(89, 200, 55);
            --close-button-icon-color: rgba(233, 82, 74);

            --min-button-order: 1;
            --max-button-order: 2;
            --close-button-order: 3;

            --control-button-symbol-weight: 800;
            --control-button-symbol-size: 18px;
        }
        .spotify__container--is-desktop:not(.fullscreen).spotify__os--is-windows
            .body-drag-top {
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
            zoom: var(--control-button-size-multiplier);
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
        }
        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 100%;
            height: 18px;
            width: 18px;
        }
        .min .icon {
            background-color: var(--min-button-icon-color);
        }
        .max .icon {
            background-color: var(--max-button-icon-color);
        }
        .close .icon {
            background-color: var(--close-button-icon-color);
        }
        .icon::before {
            font-family: "Material Symbols Outlined";
            font-weight: var(--control-button-symbol-weight);
            font-style: normal;
            font-size: var(--control-button-symbol-size);
            line-height: 0;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            color: var(--control-button-symbol-color);
        }
        .ctrl:hover .icon::before {
            color: var(--control-button-symbol-hover-color);
        }
        .min .icon::before {
            content: "horizontal_rule";
        }
        .max .icon::before {
            content: "arrow_left arrow_right";
            word-spacing: -28px;
            transform: rotate(314deg);
        }
        .close .icon::before {
            content: "close";
        }
        `,
        lin: `
        @import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);

        :root {
            --control-button-width: 60px;
            --control-button-height: 52px;
            --control-button-size-multiplier: 1;

            --control-button-bg-color: transparent;
            --control-button-bg-hover-color: transparent;
            --min-button-symbol-color: var(--spice-subtext);
            --max-button-symbol-color: var(--spice-subtext);
            --close-button-symbol-color: var(--spice-main);
            --min-button-symbol-hover-color: var(--spice-text);
            --max-button-symbol-hover-color: var(--spice-text);
            --close-button-symbol-hover-color: var(--spice-main);
            --min-button-icon-color: transparent;
            --min-button-icon-hover-color: rgba(var(--spice-rgb-selected-row), 0.1);
            --max-button-icon-color: transparent;
            --max-button-icon-hover-color: rgba(var(--spice-rgb-selected-row), 0.1);
            --close-button-icon-color: var(--spice-subtext);
            --close-button-icon-hover-color: var(--spice-notification-error);

            --min-button-order: 1;
            --max-button-order: 2;
            --close-button-order: 3;

            --control-button-symbol-weight: 800;
            --control-button-symbol-size: 18px;
        }
        .spotify__container--is-desktop:not(.fullscreen).spotify__os--is-windows
            .body-drag-top {
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
            zoom: var(--control-button-size-multiplier);
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
        }
        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 100%;
            height: 18px;
            width: 18px;
        }
        .min .icon {
            background-color: var(--min-button-icon-color);
        }
        .max .icon {
            background-color: var(--max-button-icon-color);
        }
        .close .icon {
            background-color: var(--close-button-icon-color);
        }
        .min:hover .icon {
            background-color: var(--min-button-icon-hover-color);
        }
        .max:hover .icon {
            background-color: var(--max-button-icon-hover-color);
        }
        .close:hover .icon {
            background-color: var(--close-button-icon-hover-color);
        }
        .icon::before {
            font-family: "Material Symbols Outlined";
            font-weight: var(--control-button-symbol-weight);
            font-style: normal;
            font-size: var(--control-button-symbol-size);
            line-height: 0;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
        }
        .min .icon::before {
            content: "horizontal_rule";
            color: var(--min-button-symbol-color);
        }
        .max .icon::before {
            content: "arrow_left arrow_right";
            color: var(--max-button-symbol-color);
            word-spacing: -28px;
            transform: rotate(314deg);
        }
        .close .icon::before {
            content: "close";
            color: var(--close-button-symbol-color);
        }
        .min:hover .icon::before {
            color: var(--min-button-symbol-hover-color);
        }
        .max:hover .icon::before {
            color: var(--max-button-symbol-hover-color);
        }
        .close:hover .icon::before {
            color: var(--close-button-symbol-hover-color);
        }
        `,
        dots: `
        @import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);

        :root {
            --control-button-width: 60px;
            --control-button-height: 52px;
            --control-button-size-multiplier: 1;

            --control-button-bg-color: transparent;
            --control-button-icon-color: var(--spice-subtext);
            --control-button-bg-hover-color: transparent;
            --control-button-icon-hover-color: var(--spice-text);

            --min-button-order: 1;
            --max-button-order: 2;
            --close-button-order: 3;

            --control-button-symbol-weight: 300;
            --control-button-symbol-size: 24px;
        }
        .spotify__container--is-desktop:not(.fullscreen).spotify__os--is-windows
            .body-drag-top {
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
            zoom: var(--control-button-size-multiplier);
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
        .icon::before {
            font-family: "Material Symbols Outlined";
            font-weight: var(--control-button-symbol-weight);
            font-style: normal;
            font-size: var(--control-button-symbol-size);
            line-height: 2;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
        }
        .min .icon::before {
            content: "apps";
            clip-path: polygon(0 45%, 45% 45%, 45% 0, 100% 0, 100% 100%, 0 100%);
        }
        .max .icon::before {
            content: "apps";
            clip-path: polygon(0 100%, 0 0, 100% 0, 100% 55%, 55% 55%, 55% 100%);
        }
        .close .icon::before {
            content: "apps";
        }
        .min:hover .icon::before {
            content: "horizontal_rule";
            clip-path: unset;
        }
        .max:hover .icon::before {
            content: "check_box_outline_blank";
            clip-path: unset;
        }
        .close:hover .icon::before {
            content: "close";
        }
        `,
        rounded: `
        @import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);

        :root {
            --control-button-width: 60px;
            --control-button-height: 52px;
            --control-button-size-multiplier: 1;

            --control-button-bg-color: transparent;
            --control-button-bg-hover-color: transparent;
            --control-button-symbol-color: transparent;
            --control-button-symbol-hover-color: rgba(0, 0, 0, 0.6);
            --min-button-icon-color: var(--spice-subtext);
            --max-button-icon-color: var(--spice-subtext);
            --close-button-icon-color: var(--spice-subtext);
            --min-button-icon-hover-color: rgba(241, 174, 27);
            --max-button-icon-hover-color: rgba(89, 200, 55);
            --close-button-icon-hover-color: rgba(233, 82, 74);

            --min-button-order: 1;
            --max-button-order: 2;
            --close-button-order: 3;

            --control-button-symbol-weight: 800;
            --control-button-symbol-size: 18px;
        }
        .spotify__container--is-desktop:not(.fullscreen).spotify__os--is-windows
            .body-drag-top {
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
            zoom: var(--control-button-size-multiplier);
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
        }
        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 100%;
            height: 18px;
            width: 18px;
        }
        .min .icon {
            background-color: var(--min-button-icon-color);
        }
        .max .icon {
            background-color: var(--max-button-icon-color);
        }
        .close .icon {
            background-color: transparent;
            outline: 6px solid var(--close-button-icon-color);
            outline-offset: -6px;
        }
        .min:hover .icon {
            background-color: var(--min-button-icon-hover-color);
        }
        .max:hover .icon {
            background-color: var(--max-button-icon-hover-color);
        }
        .close:hover .icon {
            background-color: var(--close-button-icon-hover-color);
            outline: unset;
        }
        .icon::before {
            font-family: "Material Symbols Outlined";
            font-weight: var(--control-button-symbol-weight);
            font-style: normal;
            font-size: var(--control-button-symbol-size);
            line-height: 0;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            color: var(--control-button-symbol-color);
        }
        .ctrl:hover .icon::before {
            color: var(--control-button-symbol-hover-color);
        }
        .min .icon::before {
            content: "horizontal_rule";
        }
        .max .icon::before {
            content: "arrow_left arrow_right";
            word-spacing: -28px;
            transform: rotate(314deg);
        }
        .close .icon::before {
            content: "close";
        }
        `,
        dash: `
        @import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);

        :root {
            --control-button-width: 60px;
            --control-button-height: 52px;
            --control-button-size-multiplier: 1;

            --control-button-bg-color: transparent;
            --control-button-icon-color: var(--spice-subtext);
            --control-button-bg-hover-color: transparent;
            --control-button-icon-hover-color: var(--spice-text);

            --min-button-order: 1;
            --max-button-order: 2;
            --close-button-order: 3;

            --control-button-symbol-weight: 300;
            --control-button-symbol-size: 48px;
        }
        .spotify__container--is-desktop:not(.fullscreen).spotify__os--is-windows
            .body-drag-top {
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
            overflow: hidden;
        }
        .ctrl {
            display: flex;
            justify-content: center;
            align-items: center;
            width: var(--control-button-width);
            height: var(--control-button-height);
            background-color: var(--control-button-bg-color);
            color: var(--control-button-icon-color);
            zoom: var(--control-button-size-multiplier);
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
        .icon::before {
            font-family: "Material Symbols Outlined";
            font-weight: var(--control-button-symbol-weight);
            font-style: normal;
            font-size: var(--control-button-symbol-size);
            line-height: 0.5;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
        }
        .min .icon::before,
        .max .icon::before,
        .close .icon::before {
            content: "pen_size_4";
            transform: rotate(45deg);
        }
    `,
        slash: `
        :root {
            --control-button-width: 60px;
            --control-button-height: 52px;
            --control-button-size-multiplier: 1;

            --control-button-bg-color: transparent;
            --control-button-icon-color: var(--spice-subtext);
            --control-button-bg-hover-color: transparent;
            --control-button-icon-hover-color: var(--spice-text);

            --min-button-order: 1;
            --max-button-order: 2;
            --close-button-order: 3;
        }
        .spotify__container--is-desktop:not(.fullscreen).spotify__os--is-windows
            .body-drag-top {
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
            zoom: var(--control-button-size-multiplier);
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
        }
        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 18px;
            width: 18px;
            background-color: var(--control-button-icon-color);
            clip-path: polygon(100% 0%, 100% 30%, 30% 100%, 0% 100%, 0 70%, 70% 0);
        }
        .ctrl:hover .icon {
            background-color: var(--control-button-icon-hover-color);
        }
        .min:hover .icon {
            clip-path: polygon(0% 30%, 100% 30%, 100% 70%, 0% 70%);
        }
        .max:hover .icon {
            clip-path: polygon(
                0% 0%,
                0% 100%,
                40% 100%,
                40% 40%,
                60% 40%,
                60% 60%,
                40% 60%,
                40% 100%,
                100% 100%,
                100% 0%
            );
        }
        .close:hover .icon {
            clip-path: polygon(
                0% 0%,
                30% 0%,
                50% 20%,
                70% 0%,
                100% 0%,
                100% 30%,
                80% 50%,
                100% 70%,
                100% 100%,
                70% 100%,
                50% 80%,
                30% 100%,
                0% 100%,
                0% 70%,
                20% 50%,
                0% 30%
            );
        }
        `,
        nu: `
        @import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);

        :root {
            --control-button-width: 65px;
            --control-button-height: 45px;
            --control-button-size-multiplier: 1;

            --control-button-bg-color: transparent;
            --control-button-bg-hover-color: transparent;
            --min-button-symbol-color: transparent;
            --min-button-symbol-hover-color: var(--spice-text);
            --max-button-symbol-color: transparent;
            --max-button-symbol-hover-color: var(--spice-text);
            --close-button-symbol-color: var(--spice-main);
            --close-button-symbol-hover-color: var(--spice-main);
            --min-button-icon-color: transparent;
            --min-button-icon-hover-color: rgba(var(--spice-rgb-selected-row), 0.2);
            --max-button-icon-color: transparent;
            --max-button-icon-hover-color: rgba(var(--spice-rgb-selected-row), 0.2);
            --close-button-icon-color: var(--spice-notification-error);
            --close-button-icon-hover-color: var(--spice-notification-error);

            --min-button-order: 1;
            --max-button-order: 2;
            --close-button-order: 3;

            --control-button-symbol-weight: 600;
            --control-button-symbol-size: 24px;
        }
        .spotify__container--is-desktop:not(.fullscreen).spotify__os--is-windows
            .body-drag-top {
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
            overflow: hidden;
        }
        .ctrl {
            display: flex;
            justify-content: center;
            align-items: center;
            width: var(--control-button-width);
            height: var(--control-button-height);
            background-color: var(--control-button-bg-color);
            zoom: var(--control-button-size-multiplier);
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
        }
        .icon {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            height: 27px;
            width: 53px;
        }
        .min .icon {
            background-color: var(--min-button-icon-color);
        }
        .max .icon {
            background-color: var(--max-button-icon-color);
        }
        .close .icon {
            background-color: var(--close-button-icon-color);
        }
        .min:hover .icon {
            background-color: var(--min-button-icon-hover-color);
        }
        .max:hover .icon {
            background-color: var(--max-button-icon-hover-color);
        }
        .close:hover .icon {
            background-color: var(--close-button-icon-hover-color);
        }
        .icon::before {
            font-family: "Material Symbols Outlined";
            font-weight: var(--control-button-symbol-weight);
            font-style: normal;
            font-size: var(--control-button-symbol-size);
            line-height: 0;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
        }
        .min .icon::before {
            content: "keyboard_arrow_down";
            color: var(--min-button-symbol-color);
        }
        .max .icon::before {
            content: "keyboard_arrow_up";
            color: var(--max-button-symbol-color);
        }
        .close .icon::before {
            content: "close";
            color: var(--close-button-symbol-color);
        }
        .min:hover .icon::before {
            color: var(--min-button-symbol-hover-color);
        }
        .max:hover .icon::before {
            color: var(--max-button-symbol-hover-color);
        }
        .close:hover .icon::before {
            content: "chevron_right close chevron_left";
            color: var(--close-button-symbol-hover-color);
            word-spacing: -37px;
        }
        `,
    };
    const style = document.createElement("style");
    style.id = "customControls_style";
    style.innerHTML = cssControlStyles[config.controlsStyle];
    document.head.appendChild(style);

    const min = titlebar.querySelector(".min");
    min.onclick = function minAction() {
        alert(
            "[customControls extension]: Minimizing the window is not possible due to limitations.\n\nPress Win+Down to minimize."
        );
    };

    const max = titlebar.querySelector(".max");
    max.onclick = function maxAction() {
        if (config.fullscreenMaximize) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        } else {
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
        }
    };

    const close = titlebar.querySelector(".close");
    close.onclick = function closeAction() {
        window.close();
    };

    async function openModal() {
        const configContainer = react.createElement(
            "div",
            {
                id: `ccSettings`,
            },
            react.createElement("style", {
                dangerouslySetInnerHTML: {
                    __html: settingsStyle,
                },
            }),
            react.createElement(OptionList, {
                items: [
                    {
                        desc: "Full Screen Maximize",
                        info: "Have the maximize button toggle full screen instead",
                        key: "fullscreenMaximize",
                        type: ConfigSlider,
                    },
                    {
                        desc: "Control Style",
                        info: "Choose a style for your control buttons",
                        key: "controlsStyle",
                        type: ConfigSelection,
                        options: {
                            win: "win",
                            mac: "mac",
                            lin: "lin",
                            dots: "dots",
                            rounded: "rounded",
                            dash: "dash",
                            slash: "slash",
                            nu: "nu",
                        },
                    },
                ],
                onChange: (name, value) => {
                    if (name === "controlsStyle") {
                        style.innerHTML = cssControlStyles[value];
                    }
                    config[name] = value;

                    console.log(config, name, value);
                    localStorage.setItem(
                        "customControls:config",
                        JSON.stringify(config)
                    );
                },
            })
        );

        Spicetify.PopupModal.display({
            title: "Custom Controls",
            content: configContainer,
            isLarge: true,
        });
    }

    new Spicetify.Menu.Item("Custom Controls", false, openModal).register();
})();
