"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// https://cookieconsent.insites.com
!function (e) {
    if (!e.hasInitialised) {
        var t = {
            escapeRegExp: function escapeRegExp(e) {
                return e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            hasClass: function hasClass(e, t) {
                var i = " ";
                return 1 === e.nodeType && (i + e.className + i).replace(/[\n\t]/g, i).indexOf(i + t + i) >= 0;
            },
            addClass: function addClass(e, t) {
                e.className += " " + t;
            },
            removeClass: function removeClass(e, t) {
                var i = new RegExp("\\b" + this.escapeRegExp(t) + "\\b");
                e.className = e.className.replace(i, "");
            },
            interpolateString: function interpolateString(e, t) {
                var i = /{{([a-z][a-z0-9\-_]*)}}/gi;
                return e.replace(i, function (e) {
                    return t(arguments[1]) || "";
                });
            },
            getCookie: function getCookie(e) {
                var t = "; " + document.cookie,
                    i = t.split("; " + e + "=");
                return 2 != i.length ? void 0 : i.pop().split(";").shift();
            },
            setCookie: function setCookie(e, t, i, n, o) {
                var s = new Date();
                s.setDate(s.getDate() + (i || 365));
                var r = [e + "=" + t, "expires=" + s.toUTCString(), "path=" + (o || "/")];
                n && r.push("domain=" + n), document.cookie = r.join(";");
            },
            deepExtend: function deepExtend(e, t) {
                for (var i in t) {
                    t.hasOwnProperty(i) && (i in e && this.isPlainObject(e[i]) && this.isPlainObject(t[i]) ? this.deepExtend(e[i], t[i]) : e[i] = t[i]);
                }return e;
            },
            throttle: function throttle(e, t) {
                var i = !1;
                return function () {
                    i || (e.apply(this, arguments), i = !0, setTimeout(function () {
                        i = !1;
                    }, t));
                };
            },
            hash: function hash(e) {
                var t,
                    i,
                    n,
                    o = 0;
                if (0 === e.length) return o;
                for (t = 0, n = e.length; t < n; ++t) {
                    i = e.charCodeAt(t), o = (o << 5) - o + i, o |= 0;
                }return o;
            },
            normaliseHex: function normaliseHex(e) {
                return "#" == e[0] && (e = e.substr(1)), 3 == e.length && (e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2]), e;
            },
            getContrast: function getContrast(e) {
                e = this.normaliseHex(e);
                var t = parseInt(e.substr(0, 2), 16),
                    i = parseInt(e.substr(2, 2), 16),
                    n = parseInt(e.substr(4, 2), 16),
                    o = (299 * t + 587 * i + 114 * n) / 1e3;
                return o >= 128 ? "#000" : "#fff";
            },
            getLuminance: function getLuminance(e) {
                var t = parseInt(this.normaliseHex(e), 16),
                    i = 38,
                    n = (t >> 16) + i,
                    o = (t >> 8 & 255) + i,
                    s = (255 & t) + i,
                    r = (16777216 + 65536 * (n < 255 ? n < 1 ? 0 : n : 255) + 256 * (o < 255 ? o < 1 ? 0 : o : 255) + (s < 255 ? s < 1 ? 0 : s : 255)).toString(16).slice(1);
                return "#" + r;
            },
            isMobile: function isMobile() {
                return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                );
            },
            isPlainObject: function isPlainObject(e) {
                return "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) && null !== e && e.constructor == Object;
            }
        };
        e.status = {
            deny: "deny",
            allow: "allow",
            dismiss: "dismiss"
        }, e.transitionEnd = function () {
            var e = document.createElement("div"),
                t = {
                t: "transitionend",
                OT: "oTransitionEnd",
                msT: "MSTransitionEnd",
                MozT: "transitionend",
                WebkitT: "webkitTransitionEnd"
            };
            for (var i in t) {
                if (t.hasOwnProperty(i) && "undefined" != typeof e.style[i + "ransition"]) return t[i];
            }return "";
        }(), e.hasTransition = !!e.transitionEnd;
        var i = Object.keys(e.status).map(t.escapeRegExp);
        e.customStyles = {}, e.Popup = function () {
            function n() {
                this.initialise.apply(this, arguments);
            }
            function o(e) {
                this.openingTimeout = null, t.removeClass(e, "cc-invisible");
            }
            function s(t) {
                t.style.display = "none", t.removeEventListener(e.transitionEnd, this.afterTransition), this.afterTransition = null;
            }
            function r() {
                var t = this.options.onInitialise.bind(this);
                if (!window.navigator.cookieEnabled) return t(e.status.deny), !0;
                if (window.CookiesOK || window.navigator.CookiesOK) return t(e.status.allow), !0;
                var i = Object.keys(e.status),
                    n = this.getStatus(),
                    o = i.indexOf(n) >= 0;
                return o && t(n), o;
            }
            function a() {
                var e = this.options.position.split("-"),
                    t = [];
                return e.forEach(function (e) {
                    t.push("cc-" + e);
                }), t;
            }
            function c() {
                var e = this.options,
                    i = "top" == e.position || "bottom" == e.position ? "banner" : "floating";
                t.isMobile() && (i = "floating");
                var n = ["cc-" + i, "cc-type-" + e.type, "cc-theme-" + e.theme];
                e["static"] && n.push("cc-static"), n.push.apply(n, a.call(this));
                p.call(this, this.options.palette);
                return this.customStyleSelector && n.push(this.customStyleSelector), n;
            }
            function l() {
                var e = {},
                    i = this.options;
                i.showLink || (i.elements.link = "", i.elements.messagelink = i.elements.message), Object.keys(i.elements).forEach(function (n) {
                    e[n] = t.interpolateString(i.elements[n], function (e) {
                        var t = i.content[e];
                        return e && "string" == typeof t && t.length ? t : "";
                    });
                });
                var n = i.compliance[i.type];
                n || (n = i.compliance.info), e.compliance = t.interpolateString(n, function (t) {
                    return e[t];
                });
                var o = i.layouts[i.layout];
                return o || (o = i.layouts.basic), t.interpolateString(o, function (t) {
                    return e[t];
                });
            }
            function u(i) {
                var n = this.options,
                    o = document.createElement("div"),
                    s = n.container && 1 === n.container.nodeType ? n.container : document.body;
                o.innerHTML = i;
                var r = o.children[0];
                return r.style.display = "none", t.hasClass(r, "cc-window") && e.hasTransition && t.addClass(r, "cc-invisible"), this.onButtonClick = h.bind(this), r.addEventListener("click", this.onButtonClick), n.autoAttach && (s.firstChild ? s.insertBefore(r, s.firstChild) : s.appendChild(r)), r;
            }
            function h(n) {
                var o = n.target;
                if (t.hasClass(o, "cc-btn")) {
                    var s = o.className.match(new RegExp("\\bcc-(" + i.join("|") + ")\\b")),
                        r = s && s[1] || !1;
                    r && (this.setStatus(r), this.close(!0));
                }
                t.hasClass(o, "cc-close") && (this.setStatus(e.status.dismiss), this.close(!0)), t.hasClass(o, "cc-revoke") && this.revokeChoice();
            }
            function p(e) {
                var i = t.hash(JSON.stringify(e)),
                    n = "cc-color-override-" + i,
                    o = t.isPlainObject(e);
                return this.customStyleSelector = o ? n : null, o && d(i, e, "." + n), o;
            }
            function d(i, n, o) {
                if (e.customStyles[i]) return void ++e.customStyles[i].references;
                var s = {},
                    r = n.popup,
                    a = n.button,
                    c = n.highlight;
                r && (r.text = r.text ? r.text : t.getContrast(r.background), r.link = r.link ? r.link : r.text, s[o + ".cc-window"] = ["color: " + r.text, "background-color: " + r.background], s[o + ".cc-revoke"] = ["color: " + r.text, "background-color: " + r.background], s[o + " .cc-link," + o + " .cc-link:active," + o + " .cc-link:visited"] = ["color: " + r.link], a && (a.text = a.text ? a.text : t.getContrast(a.background), a.border = a.border ? a.border : "transparent", s[o + " .cc-btn"] = ["color: " + a.text, "border-color: " + a.border, "background-color: " + a.background], "transparent" != a.background && (s[o + " .cc-btn:hover, " + o + " .cc-btn:focus"] = ["background-color: " + v(a.background)]), c ? (c.text = c.text ? c.text : t.getContrast(c.background), c.border = c.border ? c.border : "transparent", s[o + " .cc-highlight .cc-btn:first-child"] = ["color: " + c.text, "border-color: " + c.border, "background-color: " + c.background]) : s[o + " .cc-highlight .cc-btn:first-child"] = ["color: " + r.text]));
                var l = document.createElement("style");
                document.head.appendChild(l), e.customStyles[i] = {
                    references: 1,
                    element: l.sheet
                };
                var u = -1;
                for (var h in s) {
                    s.hasOwnProperty(h) && l.sheet.insertRule(h + "{" + s[h].join(";") + "}", ++u);
                }
            }
            function v(e) {
                return e = t.normaliseHex(e), "000000" == e ? "#222" : t.getLuminance(e);
            }
            function f(i) {
                if (t.isPlainObject(i)) {
                    var n = t.hash(JSON.stringify(i)),
                        o = e.customStyles[n];
                    if (o && ! --o.references) {
                        var s = o.element.ownerNode;
                        s && s.parentNode && s.parentNode.removeChild(s), e.customStyles[n] = null;
                    }
                }
            }
            function m(e, t) {
                for (var i = 0, n = e.length; i < n; ++i) {
                    var o = e[i];
                    if (o instanceof RegExp && o.test(t) || "string" == typeof o && o.length && o === t) return !0;
                }
                return !1;
            }
            function b() {
                var t = this.setStatus.bind(this),
                    i = this.options.dismissOnTimeout;
                "number" == typeof i && i >= 0 && (this.dismissTimeout = window.setTimeout(function () {
                    t(e.status.dismiss);
                }, Math.floor(i)));
                var n = this.options.dismissOnScroll;
                if ("number" == typeof n && n >= 0) {
                    var o = function o(i) {
                        window.pageYOffset > Math.floor(n) && (t(e.status.dismiss), window.removeEventListener("scroll", o), this.onWindowScroll = null);
                    };
                    this.onWindowScroll = o, window.addEventListener("scroll", o);
                }
            }
            function y() {
                if ("info" != this.options.type && (this.options.revokable = !0), t.isMobile() && (this.options.animateRevokable = !1), this.options.revokable) {
                    var e = a.call(this);
                    this.options.animateRevokable && e.push("cc-animate"), this.customStyleSelector && e.push(this.customStyleSelector);
                    var i = this.options.revokeBtn.replace("{{classes}}", e.join(" "));
                    this.revokeBtn = u.call(this, i);
                    var n = this.revokeBtn;
                    if (this.options.animateRevokable) {
                        var o = t.throttle(function (e) {
                            var i = !1,
                                o = 20,
                                s = window.innerHeight - 20;
                            t.hasClass(n, "cc-top") && e.clientY < o && (i = !0), t.hasClass(n, "cc-bottom") && e.clientY > s && (i = !0), i ? t.hasClass(n, "cc-active") || t.addClass(n, "cc-active") : t.hasClass(n, "cc-active") && t.removeClass(n, "cc-active");
                        }, 200);
                        this.onMouseMove = o, window.addEventListener("mousemove", o);
                    }
                }
            }
            var g = {
                enabled: !0,
                container: null,
                cookie: {
                    name: "cookieconsent_status",
                    path: "/",
                    domain: "",
                    expiryDays: 365
                },
                onPopupOpen: function onPopupOpen() {},
                onPopupClose: function onPopupClose() {},
                onInitialise: function onInitialise(e) {},
                onStatusChange: function onStatusChange(e, t) {},
                onRevokeChoice: function onRevokeChoice() {},
                content: {
                    header: "Cookies used on the website!",
                    message: "This website uses cookies to ensure you get the best experience on our website.",
                    dismiss: "Got it!",
                    allow: "Allow cookies",
                    deny: "Decline",
                    link: "Learn more",
                    href: "http://cookiesandyou.com",
                    close: "&#x274c;"
                },
                elements: {
                    header: '<span class="cc-header">{{header}}</span>&nbsp;',
                    message: '<span id="cookieconsent:desc" class="cc-message">{{message}}</span>',
                    messagelink: '<span id="cookieconsent:desc" class="cc-message">{{message}} <a aria-label="learn more about cookies" role=button tabindex="0" class="cc-link" href="{{href}}" target="_blank">{{link}}</a></span>',
                    dismiss: '<a aria-label="dismiss cookie message" role=button tabindex="0" class="cc-btn cc-dismiss">{{dismiss}}</a>',
                    allow: '<a aria-label="allow cookies" role=button tabindex="0"  class="cc-btn cc-allow">{{allow}}</a>',
                    deny: '<a aria-label="deny cookies" role=button tabindex="0" class="cc-btn cc-deny">{{deny}}</a>',
                    link: '<a aria-label="learn more about cookies" role=button tabindex="0" class="cc-link" href="{{href}}" target="_blank">{{link}}</a>',
                    close: '<span aria-label="dismiss cookie message" role=button tabindex="0" class="cc-close">{{close}}</span>'
                },
                window: '<div role="dialog" aria-live="polite" aria-label="cookieconsent" aria-describedby="cookieconsent:desc" class="cc-window {{classes}}"><!--googleoff: all-->{{children}}<!--googleon: all--></div>',
                revokeBtn: '<div class="cc-revoke {{classes}}">Cookie Policy</div>',
                compliance: {
                    info: '<div class="cc-compliance">{{dismiss}}</div>',
                    "opt-in": '<div class="cc-compliance cc-highlight">{{dismiss}}{{allow}}</div>',
                    "opt-out": '<div class="cc-compliance cc-highlight">{{deny}}{{dismiss}}</div>'
                },
                type: "info",
                layouts: {
                    basic: "{{messagelink}}{{compliance}}",
                    "basic-close": "{{messagelink}}{{compliance}}{{close}}",
                    "basic-header": "{{header}}{{message}}{{link}}{{compliance}}"
                },
                layout: "basic",
                position: "bottom",
                theme: "block",
                "static": !1,
                palette: null,
                revokable: !1,
                animateRevokable: !0,
                showLink: !0,
                dismissOnScroll: !1,
                dismissOnTimeout: !1,
                autoOpen: !0,
                autoAttach: !0,
                whitelistPage: [],
                blacklistPage: [],
                overrideHTML: null
            };
            return n.prototype.initialise = function (e) {
                this.options && this.destroy(), t.deepExtend(this.options = {}, g), t.isPlainObject(e) && t.deepExtend(this.options, e), r.call(this) && (this.options.enabled = !1), m(this.options.blacklistPage, location.pathname) && (this.options.enabled = !1), m(this.options.whitelistPage, location.pathname) && (this.options.enabled = !0);
                var i = this.options.window.replace("{{classes}}", c.call(this).join(" ")).replace("{{children}}", l.call(this)),
                    n = this.options.overrideHTML;
                if ("string" == typeof n && n.length && (i = n), this.options["static"]) {
                    var o = u.call(this, '<div class="cc-grower">' + i + "</div>");
                    o.style.display = "", this.element = o.firstChild, this.element.style.display = "none", t.addClass(this.element, "cc-invisible");
                } else this.element = u.call(this, i);
                b.call(this), y.call(this), this.options.autoOpen && this.autoOpen();
            }, n.prototype.destroy = function () {
                this.onButtonClick && this.element && (this.element.removeEventListener("click", this.onButtonClick), this.onButtonClick = null), this.dismissTimeout && (clearTimeout(this.dismissTimeout), this.dismissTimeout = null), this.onWindowScroll && (window.removeEventListener("scroll", this.onWindowScroll), this.onWindowScroll = null), this.onMouseMove && (window.removeEventListener("mousemove", this.onMouseMove), this.onMouseMove = null), this.element && this.element.parentNode && this.element.parentNode.removeChild(this.element), this.element = null, this.revokeBtn && this.revokeBtn.parentNode && this.revokeBtn.parentNode.removeChild(this.revokeBtn), this.revokeBtn = null, f(this.options.palette), this.options = null;
            }, n.prototype.open = function (t) {
                if (this.element) return this.isOpen() || (e.hasTransition ? this.fadeIn() : this.element.style.display = "", this.options.revokable && this.toggleRevokeButton(), this.options.onPopupOpen.call(this)), this;
            }, n.prototype.close = function (t) {
                if (this.element) return this.isOpen() && (e.hasTransition ? this.fadeOut() : this.element.style.display = "none", t && this.options.revokable && this.toggleRevokeButton(!0), this.options.onPopupClose.call(this)), this;
            }, n.prototype.fadeIn = function () {
                var i = this.element;
                if (e.hasTransition && i && (this.afterTransition && s.call(this, i), t.hasClass(i, "cc-invisible"))) {
                    if (i.style.display = "", this.options["static"]) {
                        var n = this.element.clientHeight;
                        this.element.parentNode.style.maxHeight = n + "px";
                    }
                    var r = 20;
                    this.openingTimeout = setTimeout(o.bind(this, i), r);
                }
            }, n.prototype.fadeOut = function () {
                var i = this.element;
                e.hasTransition && i && (this.openingTimeout && (clearTimeout(this.openingTimeout), o.bind(this, i)), t.hasClass(i, "cc-invisible") || (this.options["static"] && (this.element.parentNode.style.maxHeight = ""), this.afterTransition = s.bind(this, i), i.addEventListener(e.transitionEnd, this.afterTransition), t.addClass(i, "cc-invisible")));
            }, n.prototype.isOpen = function () {
                return this.element && "" == this.element.style.display && (!e.hasTransition || !t.hasClass(this.element, "cc-invisible"));
            }, n.prototype.toggleRevokeButton = function (e) {
                this.revokeBtn && (this.revokeBtn.style.display = e ? "" : "none");
            }, n.prototype.revokeChoice = function (e) {
                this.options.enabled = !0, this.clearStatus(), this.options.onRevokeChoice.call(this), e || this.autoOpen();
            }, n.prototype.hasAnswered = function (t) {
                return Object.keys(e.status).indexOf(this.getStatus()) >= 0;
            }, n.prototype.hasConsented = function (t) {
                var i = this.getStatus();
                return i == e.status.allow || i == e.status.dismiss;
            }, n.prototype.autoOpen = function (e) {
                !this.hasAnswered() && this.options.enabled && this.open();
            }, n.prototype.setStatus = function (i) {
                var n = this.options.cookie,
                    o = t.getCookie(n.name),
                    s = Object.keys(e.status).indexOf(o) >= 0;
                Object.keys(e.status).indexOf(i) >= 0 ? (t.setCookie(n.name, i, n.expiryDays, n.domain, n.path), this.options.onStatusChange.call(this, i, s)) : this.clearStatus();
            }, n.prototype.getStatus = function () {
                return t.getCookie(this.options.cookie.name);
            }, n.prototype.clearStatus = function () {
                var e = this.options.cookie;
                t.setCookie(e.name, "", -1, e.domain, e.path);
            }, n;
        }(), e.Location = function () {
            function e(e) {
                t.deepExtend(this.options = {}, s), t.isPlainObject(e) && t.deepExtend(this.options, e), this.currentServiceIndex = -1;
            }
            function i(e, t, i) {
                var n,
                    o = document.createElement("script");
                o.type = "text/" + (e.type || "javascript"), o.src = e.src || e, o.async = !1, o.onreadystatechange = o.onload = function () {
                    var e = o.readyState;
                    clearTimeout(n), t.done || e && !/loaded|complete/.test(e) || (t.done = !0, t(), o.onreadystatechange = o.onload = null);
                }, document.body.appendChild(o), n = setTimeout(function () {
                    t.done = !0, t(), o.onreadystatechange = o.onload = null;
                }, i);
            }
            function n(e, t, i, n, o) {
                var s = new (window.XMLHttpRequest || window.ActiveXObject)("MSXML2.XMLHTTP.3.0");
                if (s.open(n ? "POST" : "GET", e, 1), s.setRequestHeader("X-Requested-With", "XMLHttpRequest"), s.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), Array.isArray(o)) for (var r = 0, a = o.length; r < a; ++r) {
                    var c = o[r].split(":", 2);
                    s.setRequestHeader(c[0].replace(/^\s+|\s+$/g, ""), c[1].replace(/^\s+|\s+$/g, ""));
                }
                "function" == typeof t && (s.onreadystatechange = function () {
                    s.readyState > 3 && t(s);
                }), s.send(n);
            }
            function o(e) {
                return new Error("Error [" + (e.code || "UNKNOWN") + "]: " + e.error);
            }
            var s = {
                timeout: 5e3,
                services: ["freegeoip", "ipinfo", "maxmind"],
                serviceDefinitions: {
                    freegeoip: function freegeoip() {
                        return {
                            url: "//freegeoip.net/json/?callback={callback}",
                            isScript: !0,
                            callback: function callback(e, t) {
                                try {
                                    var i = JSON.parse(t);
                                    return i.error ? o(i) : {
                                        code: i.country_code
                                    };
                                } catch (n) {
                                    return o({
                                        error: "Invalid response (" + n + ")"
                                    });
                                }
                            }
                        };
                    },
                    ipinfo: function ipinfo() {
                        return {
                            url: "//ipinfo.io",
                            headers: ["Accept: application/json"],
                            callback: function callback(e, t) {
                                try {
                                    var i = JSON.parse(t);
                                    return i.error ? o(i) : {
                                        code: i.country
                                    };
                                } catch (n) {
                                    return o({
                                        error: "Invalid response (" + n + ")"
                                    });
                                }
                            }
                        };
                    },
                    ipinfodb: function ipinfodb(e) {
                        return {
                            url: "//api.ipinfodb.com/v3/ip-country/?key={api_key}&format=json&callback={callback}",
                            isScript: !0,
                            callback: function callback(e, t) {
                                try {
                                    var i = JSON.parse(t);
                                    return "ERROR" == i.statusCode ? o({
                                        error: i.statusMessage
                                    }) : {
                                        code: i.countryCode
                                    };
                                } catch (n) {
                                    return o({
                                        error: "Invalid response (" + n + ")"
                                    });
                                }
                            }
                        };
                    },
                    maxmind: function maxmind() {
                        return {
                            url: "//js.maxmind.com/js/apis/geoip2/v2.1/geoip2.js",
                            isScript: !0,
                            callback: function callback(e) {
                                return window.geoip2 ? void geoip2.country(function (t) {
                                    try {
                                        e({
                                            code: t.country.iso_code
                                        });
                                    } catch (i) {
                                        e(o(i));
                                    }
                                }, function (t) {
                                    e(o(t));
                                }) : void e(new Error("Unexpected response format. The downloaded script should have exported `geoip2` to the global scope"));
                            }
                        };
                    }
                }
            };
            return e.prototype.getNextService = function () {
                var e;
                do {
                    e = this.getServiceByIdx(++this.currentServiceIndex);
                } while (this.currentServiceIndex < this.options.services.length && !e);return e;
            }, e.prototype.getServiceByIdx = function (e) {
                var i = this.options.services[e];
                if ("function" == typeof i) {
                    var n = i();
                    return n.name && t.deepExtend(n, this.options.serviceDefinitions[n.name](n)), n;
                }
                return "string" == typeof i ? this.options.serviceDefinitions[i]() : t.isPlainObject(i) ? this.options.serviceDefinitions[i.name](i) : null;
            }, e.prototype.locate = function (e, t) {
                var i = this.getNextService();
                return i ? (this.callbackComplete = e, this.callbackError = t, void this.runService(i, this.runNextServiceOnError.bind(this))) : void t(new Error("No services to run"));
            }, e.prototype.setupUrl = function (e) {
                var t = this.getCurrentServiceOpts();
                return e.url.replace(/\{(.*?)\}/g, function (i, n) {
                    if ("callback" === n) {
                        var o = "callback" + Date.now();
                        return window[o] = function (t) {
                            e.__JSONP_DATA = JSON.stringify(t);
                        }, o;
                    }
                    if (n in t.interpolateUrl) return t.interpolateUrl[n];
                });
            }, e.prototype.runService = function (e, t) {
                var o = this;
                if (e && e.url && e.callback) {
                    var s = e.isScript ? i : n,
                        r = this.setupUrl(e);
                    s(r, function (i) {
                        var n = i ? i.responseText : "";
                        e.__JSONP_DATA && (n = e.__JSONP_DATA, delete e.__JSONP_DATA), o.runServiceCallback.call(o, t, e, n);
                    }, this.options.timeout, e.data, e.headers);
                }
            }, e.prototype.runServiceCallback = function (e, t, i) {
                var n = this,
                    o = function o(t) {
                    s || n.onServiceResult.call(n, e, t);
                },
                    s = t.callback(o, i);
                s && this.onServiceResult.call(this, e, s);
            }, e.prototype.onServiceResult = function (e, t) {
                t instanceof Error || t && t.error ? e.call(this, t, null) : e.call(this, null, t);
            }, e.prototype.runNextServiceOnError = function (e, t) {
                if (e) {
                    this.logError(e);
                    var i = this.getNextService();
                    i ? this.runService(i, this.runNextServiceOnError.bind(this)) : this.completeService.call(this, this.callbackError, new Error("All services failed"));
                } else this.completeService.call(this, this.callbackComplete, t);
            }, e.prototype.getCurrentServiceOpts = function () {
                var e = this.options.services[this.currentServiceIndex];
                return "string" == typeof e ? {
                    name: e
                } : "function" == typeof e ? e() : t.isPlainObject(e) ? e : {};
            }, e.prototype.completeService = function (e, t) {
                this.currentServiceIndex = -1, e && e(t);
            }, e.prototype.logError = function (e) {
                var t = this.currentServiceIndex,
                    i = this.getServiceByIdx(t);
                console.error("The service[" + t + "] (" + i.url + ") responded with the following error", e);
            }, e;
        }(), e.Law = function () {
            function e(e) {
                this.initialise.apply(this, arguments);
            }
            var i = {
                regionalLaw: !0,
                hasLaw: ["AT", "BE", "BG", "HR", "CZ", "CY", "DK", "EE", "FI", "FR", "DE", "EL", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "SK", "SI", "ES", "SE", "GB", "UK"],
                revokable: ["HR", "CY", "DK", "EE", "FR", "DE", "LV", "LT", "NL", "PT", "ES"],
                explicitAction: ["HR", "IT", "ES"]
            };
            return e.prototype.initialise = function (e) {
                t.deepExtend(this.options = {}, i), t.isPlainObject(e) && t.deepExtend(this.options, e);
            }, e.prototype.get = function (e) {
                var t = this.options;
                return {
                    hasLaw: t.hasLaw.indexOf(e) >= 0,
                    revokable: t.revokable.indexOf(e) >= 0,
                    explicitAction: t.explicitAction.indexOf(e) >= 0
                };
            }, e.prototype.applyLaw = function (e, t) {
                var i = this.get(t);
                return i.hasLaw || (e.enabled = !1), this.options.regionalLaw && (i.revokable && (e.revokable = !0), i.explicitAction && (e.dismissOnScroll = !1, e.dismissOnTimeout = !1)), e;
            }, e;
        }(), e.initialise = function (t, i, n) {
            var o = new e.Law(t.law);
            i || (i = function i() {}), n || (n = function n() {}), e.getCountryCode(t, function (n) {
                delete t.law, delete t.location, n.code && (t = o.applyLaw(t, n.code)), i(new e.Popup(t));
            }, function (i) {
                delete t.law, delete t.location, n(i, new e.Popup(t));
            });
        }, e.getCountryCode = function (t, i, n) {
            if (t.law && t.law.countryCode) return void i({
                code: t.law.countryCode
            });
            if (t.location) {
                var o = new e.Location(t.location);
                return void o.locate(function (e) {
                    i(e || {});
                }, n);
            }
            i({});
        }, e.utils = t, e.hasInitialised = !0, window.cookieconsent = e;
    }
}(window.cookieconsent || {});
'use strict';

console.log("defer.js loaded");

var xartalog;

function hasClass(el, className) {
    if (el.classList) {
        //console.log("hasClass(): el.classList");
        return el.classList.contains(className);
    } else {
        //console.log("hasClass(): new RegExp");
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }
}

// DEBUG - SHOW
if (window.xartaDebug === true) {
    for (var i = 0; i < document.getElementsByClassName("debug").length; i++) {
        document.getElementsByClassName("debug")[i].style.display = "block";
    }

    xartalog = function xartalog(msg) {
        var p = document.getElementById('log');
        p.innerHTML = msg + "<br>" + p.innerHTML;
    };

    xartalog("<h2>Using staging server: in debug mode:</h2><br>");
} else {
    xartalog = function xartalog(msg) {
        console.log(msg);
    };
}

// https://github.com/luciferous/beepjs -------------------------------------------------------

// only first note will play (as direct consequence of click/guester) on Android Chrome
function play(keys) {
    var key = keys.shift();
    if (typeof key == 'undefined') return; // song ended
    new Beep(22050).play(key[0], key[1], [Beep.utils.amplify(8000)], function () {
        play(keys);
    });
}

// ---------------------------------------------------------------------------------------------


navDrawer.addEventListener('mouseover', function (e) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = document.querySelectorAll(".sticky")[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var navLi = _step.value;

            navLi.classList.remove("has-kbrd-hover");
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    window.navDrawer.style.opacity = 1.0;
    rendererGL.domElement.style.zIndex = YOUTUBEINFRONT;
    window.calmCylinders = true; // used in scene.js minified to homepage.js
    if (!(typeof window.moonMesh === 'undefined' || window.moonMesh === null)) {
        window.moonMesh.material.color.setHex(0xff0000);
    }
    clearTimeout(dimDrawer);
    dimDrawer = setTimeout(function () {
        rendererGL.domElement.style.zIndex = YouTubeDefault;
        window.navDrawer.style.opacity = 0.3;
        window.calmCylinders = false; // used in scene.js minified to homepage.js
        if (!(typeof window.moonMesh === 'undefined' || window.moonMesh === null)) {
            window.moonMesh.material.color.setHex(0xffffff);
        }
        if (window.controls !== null) {
            setTimeout(getOrbitControlsFocus(), 20);
        }
    }, 3000);
}, false);

navDrawer.addEventListener('touchstart', function (e) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = document.querySelectorAll(".sticky")[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var navLi = _step2.value;

            navLi.classList.remove("has-kbrd-hover");
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    usingTouchDevice = TOUCHLIKELY;
    YouTubeDefault = YOUTUBEINFRONT;
    window.calmCylinders = true; // used in scene.js minified to homepage.js
    window.navDrawer.style.opacity = 1.0;
    rendererGL.domElement.style.zIndex = YOUTUBEINFRONT;
    clearTimeout(dimDrawer);
    dimDrawer = setTimeout(function () {
        window.navDrawer.style.opacity = 0.2;
        window.calmCylinders = false; // used in scene.js minified to homepage.js
        rendererGL.domElement.style.zIndex = YouTubeDefault;

        if (window.controls !== null) {
            setTimeout(getOrbitControlsFocus(), 20);
        }
    }, 3000);
}, false);

navDrawer.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    window.calmCylinders = true; // used in scene.js minified to homepage.js
    window.navDrawer.style.opacity = 1.0;
    rendererGL.domElement.style.zIndex = YOUTUBEINFRONT;
    clearTimeout(dimDrawer);
    dimDrawer = setTimeout(function () {
        window.navDrawer.style.opacity = 0.2;
        window.calmCylinders = false; // used in scene.js minified to homepage.js
        rendererGL.domElement.style.zIndex = YouTubeDefault;

        if (window.controls !== null) {
            setTimeout(getOrbitControlsFocus(), 20);
        }
    }, 3000);

    switch (event.key) {
        case "ArrowDown":
            // Do something for "down arrow" key press.
            break;
        case "ArrowUp":
            // Do something for "up arrow" key press.
            break;
        case "ArrowLeft":
            // Do something for "left arrow" key press.
            break;
        case "ArrowRight":
            // Do something for "right arrow" key press.
            break;
        case "Tab":
            console.log("Navigation: TAB pressed");
            break;
        case "Enter":
            // Do something for "enter" or "return" key press.
            console.log("Navigation: ENTER pressed");
            break;
        case "Escape":
            // Do something for "esc" key press.
            break;
        default:
            return; // Quit when this doesn't handle the key event.
    }
    // Cancel the default action to avoid it being handled twice
    //event.preventDefault();
}, true);

var _iteratorNormalCompletion3 = true;
var _didIteratorError3 = false;
var _iteratorError3 = undefined;

try {
    for (var _iterator3 = document.querySelectorAll("#li01, #li02, #li03")[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var navLi = _step3.value;

        navLi.addEventListener("keydown", function (event) {
            if (event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }

            var focusedhref = document.querySelectorAll('.sticky :focus');
            var focusedLi = focusedhref[0].parentNode;
            var focusedLiID = focusedLi.id;
            var focusedLiNum = focusedLiID.substr(3, 1);

            console.log("focusedLiID = " + focusedLiID);
            console.log("focusedLiNum = " + focusedLiNum);

            switch (event.key) {
                case "ArrowDown":
                    var newLiNumDown = focusedLiNum % 3 + 1;
                    document.querySelector("#li0" + newLiNumDown + " a").focus();
                    break;
                case "ArrowUp":
                    var newLiNumUp = (focusedLiNum + 4) % 3 + 1;
                    document.querySelector("#li0" + newLiNumUp + " a").focus();
                    break;
                case "ArrowLeft":
                    document.querySelector("#li0" + focusedLiNum + " li > a").focus();
                    // TODO - navigate children of li01, li02, li03 etc.
                    /**
                     * This will be tricky ... focusedLiNum might be undefined? Check.
                     * Look at siblings?  Count/length children? Just need to index
                     * children that are visible, so can iterate over.
                     * 
                     * nb: don't want ArrowLeft to work if flyout menu isn't out!
                     * Will break page.
                     */
                    break;
                case "ArrowRight":
                    // TODO - navigate children of li01, li02, li03 etc.
                    break;
                case "Tab":
                    event.preventDefault();
                    break;
                case "Enter":
                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                        for (var _iterator4 = document.querySelectorAll(".sticky:not(#" + focusedLiID + ")")[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            var _navLi = _step4.value;

                            _navLi.classList.remove("has-kbrd-hover");
                        }
                    } catch (err) {
                        _didIteratorError4 = true;
                        _iteratorError4 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }
                        } finally {
                            if (_didIteratorError4) {
                                throw _iteratorError4;
                            }
                        }
                    }

                    focusedLi.classList.toggle("has-kbrd-hover");
                    event.preventDefault();
                    break;
                case "Escape":

                    break;
                default:
                    return; // Quit when this doesn't handle the key event.
            }
            // Cancel the default action to avoid it being handled twice
            //event.preventDefault();        
        }, true);
    }
} catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
} finally {
    try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
        }
    } finally {
        if (_didIteratorError3) {
            throw _iteratorError3;
        }
    }
}

function getOrbitControlsFocus() {
    document.getElementById('controlsFocus').focus();

    var path = window.location.pathname;
    var page = path.split("/").pop();

    if (!(page === "index-d.html")) {
        document.getElementById("cameraPos").style.display = "block";
        setTimeout(function () {
            // consider how this effects keyboard access - then again Orbitcontrols!
            // but, also, look at tabindex = -1. Need to provide way to menu from
            // keyboard, when in OrbitControls ... TODO: look-up exit key combo
            document.getElementById('controlsFocus').focus();
            setTimeout(function () {
                document.getElementById("cameraPos").style.display = "none";
            }, 50);
        }, 20);
    }
    console.log("focusing on element to get OrbitControls back");
}

navDrawer.addEventListener('click', function (e) {

    // true by default, changed by touchstart events only
    if (window.NavHoverState === true) {
        new Beep(22050).play(2000, 0.05, [Beep.utils.amplify(1000)]);
    } else {
        if (!(typeof window.moonMesh === 'undefined' || window.moonMesh === null)) {
            window.moonMesh.material.color.setHex(0xffffff);
        }
        new Beep(22050).play(500, 0.05, [Beep.utils.amplify(1000)]);
    }
}, false);

orbClick.onmouseover = function () {
    new Beep(22050).play(2000, 0.05, [Beep.utils.amplify(1000)]);
};
orbClick.onclick = loadOrbitControls;

function loadOrbitControls() {
    console.log("enter loadOrbitControls");
    if (typeof window.controls === 'undefined' || window.controls === null) {
        console.log("controls are undefinied or null - so will download script and create");
        var script = document.createElement("script");
        script.src = 'js/OrbitControls-min.js';

        play([[392, 0.2], [440, 0.3], [349, 0.2], [175, 0.3], [262, 1]]);

        document.getElementsByTagName('head')[0].appendChild(script);

        script.onload = function () {

            console.log("OrbitControls-min.js loaded");
            window.controls = new THREE.OrbitControls(camera, rendererGL.domElement);
        };

        var path = window.location.pathname;
        var page = path.split("/").pop();
        //console.log( page );
        if (page === "index-d.html") {
            document.getElementById("cameraPos").style.display = "block";
        }

        // don't want to press the button again
        document.getElementById("orbitControls").style.display = "none";
    } else {
        console.log("Apparently controls already exist");

        //window.controls.dispose();
        if (YouTubeDefault == YOUTUBEINFRONT) {
            console.log("window.controls.enabled=false");
            window.controls.enabled = false;
        } else {
            console.log("window.controls.enabled=true");
            window.controls.enabled = true;
        }
    }
    return false;
}

YouTubeLink.addEventListener('touchstart', function (e) {
    document.getElementById("li03").classList.toggle("has-hover");
}, false);

YouTubeLink.onclick = function () {
    // toggle z-index of CSS3D renderer (with YouTube)
    // to make controls accssible
    if (YouTubeClickedYet == YOUTUBECLICKED) {
        controls.saveState();
        if (usingTouchDevice == TOUCHNOTLIKELY) {
            if (YouTubeDefault == YOUTUBEBEHIND) {
                YouTubeDefault = YOUTUBEINFRONT;
            } else {
                YouTubeDefault = YOUTUBEBEHIND;
            }
        } else {
            screenFullSize("s1"); // ASSUMPTION - SMALL SCREEN IS TOUCH DEVICE - JUST ONE EMBED
        }
    }
    YouTubeClickedYet = YOUTUBECLICKED;
    loadOrbitControls(); // also toggles enabled if already loaded, depending on z-index
    YouTubeVidWall(); // will only add the videos once
    return false;
};

// experimenting with touch, for cancelling sticky flyout menu on repeated-tap
// THIS IS DEPENDENT ON HACKY-WAY OF USING KNOWN INFORMATION ON OPACITY STATE

for (var i = 0; i < document.getElementsByClassName("sticky").length; i++) {
    var topListButtonID = document.getElementsByClassName("sticky")[i].id;

    xartalog("Adding event listener for (" + topListButtonID + ").children[0]");
    //xartalog("children length: " + document.getElementsByClassName("sticky")[i].children.length);

    //for (var k=0; k<document.getElementById(topListButtonID).children.length; k++)
    //{
    //xartalog(k + ": " + document.getElementById(topListButtonID).children[k].innerHTML);
    //}


    (function (topListButtonID) {

        // children[0] should be the <a> href link ... using that for touch detect
        var topListButtonLINK = document.getElementById(topListButtonID).children[0];
        topListButtonLINK.addEventListener('touchstart', function (e) {
            //var touchlist = e.touches;

            // check out pseudo focus: ... see if can use instead
            var alreadySelected = window.getComputedStyle(document.getElementById(topListButtonID)).opacity > 0.9;
            window.navDrawer.style.opacity = 1.0;

            xartalog("<h2>touchstart:</h2><br>Already selected (" + topListButtonID + "): " + alreadySelected);

            if (alreadySelected) {
                document.getElementById(topListButtonID).classList.toggle("has-hover");
                xartalog("toggle has-hover");
            } else {
                document.getElementById(topListButtonID).classList.add("has-hover");
                xartalog("add has-hover");
            }

            if (hasClass(document.getElementById(topListButtonID), "has-hover")) {
                window.NavHoverState = true;
                log("window.NavHoverState = true");
            } else {
                window.NavHoverState = false;
                //console.log("window.NavHOverState = false");
            }
        }, false);
    })(topListButtonID);
}

// *********************************************************************************************
/**
 * YOUTUBE
 */

var ytWidth = 480; // YouTube
var ytHeight = 360;
var vidWall = null;
var Element;
var YtUnderConstruction;
var screens;

Element = function Element(id, x, y, z, ry, screenID) {
    var div = document.createElement('div');
    div.setAttribute("id", "vidElementDiv_" + screenID);
    div.style.width = ytWidth.toString() + 'px';
    div.style.height = ytHeight.toString() + 'px';
    div.style.backgroundColor = '#000';
    div.style.zIndex = '13';

    var divPause = document.createElement('div');
    divPause.setAttribute("id", "pause_" + screenID);
    divPause.style.width = ytWidth.toString() + 'px';
    divPause.style.height = (ytHeight - 50).toString() + 'px';
    divPause.style.backgroundColor = '#fff';
    divPause.style.opacity = 0; // set higher to debug  
    divPause.style.zIndex = '-1'; // relative to iframe
    divPause.style.position = 'relative';
    divPause.style.top = (-ytHeight).toString() + 'px';
    divPause.onclick = function () {
        pauseXartaVideo(screenID);
    };

    var iframe = document.createElement('iframe');
    iframe.setAttribute("id", screenID);
    iframe.setAttribute('allowFullScreen', true);
    iframe.setAttribute('webkitallowfullscreen', true);
    iframe.setAttribute('mozallowfullscreen', true);
    iframe.style.width = ytWidth.toString() + 'px';
    iframe.style.height = ytHeight.toString() + 'px';
    iframe.style.border = '0px';
    iframe.style.zIndex = 0; // just to be clear (bom bom)
    iframe.src = ['https://www.youtube.com/embed/', id, '?enablejsapi=1&rel=0&origin=https://xarta.co.uk'].join('');
    div.appendChild(iframe);
    div.appendChild(divPause);
    var object = new THREE.CSS3DObject(div);

    object.position.set(x, y, z);
    object.rotation.y = ry;
    return object;
};

YtUnderConstruction = function YtUnderConstruction(x, y, z, ry, elID) {
    var div = document.createElement('div');
    div.setAttribute("id", elID);
    div.setAttribute("class", "aboveYT");

    div.style.height = (ytHeight * 0.8).toString() + 'px';
    div.style.backgroundColor = '#fff';
    div.style.zIndex = '13';

    //var button = document.createElement('button');

    div.style.fontSize = '1.3rem';
    div.innerHTML = "<style>.aboveYT{padding: 5px;} " + "." + elID + "{list-style-type: square; list-style-position: inside;" + "text-indent: -40px; padding-left: 40px; margin-left: 0;}</style>" + "<h1>Under Construction:</h1><ul class='ytuc'>" + "<li>Videos still to be added. Placeholder video: my [partial] Pennine Way walk, 2012.</li>" + "<li>I'm planning on making a custom video loading GUI</li>";

    // set in index-debug.html
    if (window.YouTubeDefault == YOUTUBEBEHIND) {
        div.style.width = (ytWidth * 2).toString() + 'px';
        div.innerHTML += "</ul><p>Press the Dave => YouTube menu item again to toggle controls access</p>";
        /*
        var btnText = document.createTextNode('YouTube in front');
        button.onclick = function()
        {
            alert('I was clicked');
        }
        */
    } else {
        div.style.width = ytWidth.toString() + 'px';
        div.innerHTML += "</ul><p>Press the Dave => YouTube menu item again to make screen1 go fullscreen</p>";

        /* var btnText = document.createTextNode('FULL SCREEN');
        button.onclick = function()
        {
            screenFullSize("s1");
        }
        */
    }
    //button.appendChild( btnText );
    //div.appendChild( button );  

    var object = new THREE.CSS3DObject(div);

    object.position.set(x, y, z);
    object.rotation.y = ry;
    return object;
};

function screenFullSize(screenID) {
    fullScreen(document.getElementById(screenID));
    //screen.orientation.lock('landscape');
}

screens = { s1: null, s2: null, s3: null, s4: null };

function onYouTubeIframeAPIReady() {

    screens["s1"] = new YT.Player('s1', {
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });

    if (window.usingTouchDevice !== TOUCHLIKELY) {
        screens["s2"] = new YT.Player('s2', {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        screens["s3"] = new YT.Player('s3', {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
        screens["s4"] = new YT.Player('s4', {
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
}

//helper function
function fullScreen(element) {
    if (element.requestFullScreen) {
        element.requestFullScreen();
    } else if (element.webkitRequestFullScreen) {
        element.webkitRequestFullScreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    }
}

function onPlayerReady(event) {
    //event.target.playVideo();
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {

        // see index-debug.html
        if (window.YouTubeDefault === YOUTUBEINFRONT) {
            document.getElementById("ytuc").style.display = "none";
        }
        //alert("pause_" + event.target.getIframe().id);
        //document.getElementById("pause_" + event.target.getIframe().id).style.opacity = 1;
        document.getElementById("pause_" + event.target.getIframe().id).style.zIndex = 1;
    }
}

function stopVideo() {
    //player.stopVideo();
}

function pauseXartaVideo(screenID) {
    screens[screenID].pauseVideo();
    document.getElementById("pause_" + screenID).style.zIndex = -1;
}

function YouTubeVidWall() {
    if (vidWall === null) {
        // DO ONCE
        // TODO: ADD GUI CONTROLS TO CONTROL YOUTUBE VIA IFRAME API
        // HOPEFULLY WILL BE ABLE TO DYNAMICALLY CHANGE CONTENT TOO

        // LOAD YOUTUBE IFRAME PLAYER API -----------------------------
        // 2. This code loads the IFrame Player API code asynchronously.
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        // It will look for global function: onYouTubeIframeAPIReady()
        //  ------------------------------------------------------------

        vidWall = new THREE.Group();
        var x = 500;
        var y = -ytHeight;

        var ry = -1 * (Math.PI / 2); // rotate about so 90deg on the right

        if (window.usingTouchDevice == TOUCHLIKELY) {
            var z = -100;
            vidWall.add(new Element('DjLwd9Ih8V8', x, y, z, ry, 's1'));
            vidWall.add(new YtUnderConstruction(x, y + ytHeight, z, ry, 'ytuc'));
            sceneCSS3D.add(vidWall);
        } else {
            var z = -200;
            vidWall.add(new Element('M7lc1UVf-VE', x, y, z, ry, 's1'));
            vidWall.add(new Element('DjLwd9Ih8V8', x, y, z + ytWidth, ry, 's2'));
            vidWall.add(new Element('DjLwd9Ih8V8', x, y + ytHeight, z, ry, 's3'));
            vidWall.add(new Element('DjLwd9Ih8V8', x, y + ytHeight, z + ytWidth, ry, 's4'));
            vidWall.add(new YtUnderConstruction(x, y + 2 * ytHeight, z + 0.5 * ytWidth, ry, 'ytuc'));
            sceneCSS3D.add(vidWall);
        }

        if (window.YouTubeDefault == YOUTUBEINFRONT) {
            //camera.position.set( -358, 74, 41 );
            // camera.position.set(-170, -217, -72); // hmmm
            camera.position.set(-273, 58.43, 57);
        } else {
            camera.position.set(-498, 20, 45);
        }

        /*
        sceneCSS3D.add(new Element( 'M7lc1UVf-VE', x, y, z, ry, 's1' ) );
        sceneCSS3D.add(new Element( 'DjLwd9Ih8V8', x, y, z+ytWidth, ry, 's2' ) );
        sceneCSS3D.add(new Element( 'DjLwd9Ih8V8', x, y+ytHeight, z, ry, 's3' ) );
        sceneCSS3D.add(new Element( 'DjLwd9Ih8V8', x, y+ytHeight, z+ytWidth, ry, 's4' ) );
        */
    }

    // TODO: LOOK AT DOLLY OPTIONS E.G.
    // https://github.com/amelierosser/threejs-camera-dolly/blob/master/index.html
}

// *********************************************************************************************
/**
 * HTML5 VIDEO ELEMENT
 */

/*
// create the video element
	var video = document.createElement( 'video' );
	// video.id = 'video';
	// video.type = ' video/ogg; codecs="theora, vorbis" ';
    video.crossOrigin = "anonymous";
    video.src = "https://xarta.co.uk/videos/sintel.ogv";
	video.load(); // must call after setting/changing source
	video.play();
	
	var videoImage = document.createElement( 'canvas' );
	videoImage.width = 480;
	videoImage.height = 204;

	var videoImageContext = videoImage.getContext( '2d' );
	// background color if no video present
	videoImageContext.fillStyle = '#ffffff';
	videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

	var videoTexture = new THREE.Texture( videoImage );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
	
	var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
	// the geometry on which the movie will be displayed;
	// 		movie image will be scaled to fit these dimensions.
	var movieGeometry = new THREE.PlaneGeometry( 240, 100, 4, 4 );
	var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
	movieScreen.position.set(0,50,-100);
	sceneGL.add(movieScreen);
	
	camera.position.set(0,150,300);
	camera.lookAt(movieScreen.position);
*/
//# sourceMappingURL=defer.js.map
