// ==UserScript==
// @name         RVRB notifications
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Send push notifications when someone mentions you.
// @author       Julian Vos
// @match        https://app.rvrb.one/channel/*
// @icon         https://app.rvrb.one/favicon.ico
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/Ghoelian/rvrb-notifications/master/index.js
// @updateURL    https://raw.githubusercontent.com/Ghoelian/rvrb-notifications/master/index.js
// ==/UserScript==

(function() {
    'use strict';

    const findChat = (callback) => {
        const chatEle = document.getElementById('msgHistory');

        if (chatEle !== null && chatEle !== undefined) {
            callback(chatEle);
        } else {
            setTimeout(() => {
                findChat(callback);
            }, 500);
        }
    };

    const initScript = () => {
        if (!window.Notification) {
            console.log('Browser does not support notifications.')
        } else {
            // check if permission is already granted
            if (Notification.permission === 'granted') {
                findChat((chatEle) => {
                    const config = {
                        attributes: false,
                        childList: true,
                        subtree: true
                    };

                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            mutation.addedNodes.forEach((node) => {
                                for (let i = 0; i < node.children.length; i++) {
                                    for (let j = 0; j < node.children[i].children.length; j++) {
                                        for (let k = 0; k < node.children[i].children[j].classList.length; k++) {
                                            if (node.children[i].children[j].classList[k] === 'username') {
                                                console.log(node.children[i].innerText);
                                                new Notification('RVRB', {
                                                    body: node.children[i].innerText
                                                });
                                            }
                                        }
                                    }
                                }
                            });
                        });
                    });

                    observer.observe(chatEle, config);
                });
            } else {
                const element = document.createElement('div');
                element.id = 'notificationPopup';
                element.style.position = 'absolute';
                element.style.top = '0px';
                element.style.width = '100%';
                element.style.height = '100%';

                const dim = document.createElement('div');
                dim.classList.add('ui');
                dim.classList.add('active');
                dim.classList.add('dimmer');

                const text = document.createElement('div');
                text.style.color = 'white';
                text.innerText = 'Please allow notifications to use this script.';

                const okButton = document.createElement('button');
                okButton.id = 'allowNotifications';
                okButton.innerText = 'Allow';

                dim.appendChild(text);
                dim.appendChild(okButton);
                element.appendChild(dim);

                document.getElementById('app').appendChild(element);
            }
        }
    }

    document.addEventListener('click', (event) => {
        if (event.target.id === 'allowNotifications') {
            // request permission from the user
            Notification.requestPermission()
                .then((p) => {
                if (p === 'granted') {
                    document.getElementById('notificationPopup').style.display = 'none';
                    initScript();
                } else {
                    console.log('User blocked notifications.')
                }
            })
                .catch((err) => {
                console.error(err)
            });
        }
    });

    setTimeout(initScript, 5000);
})();
