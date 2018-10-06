//|====================================================|
//|                      core.js                       |
//|            Copyright (c) 2018 Belikhun.            |
//|      This file is licensed under MIT license.      |
//|====================================================|

class regPanel {
    constructor(elem) {
        if (elem.tagName != "PANEL")
            return false;

        this.elem = elem;
        var ehead = fcfn(elem.childNodes, "head").childNodes;
        this.etitle = fcfn(ehead, "le");
        var ri = fcfn(ehead, "ri").childNodes;
        this.eref = fcfn(ri, "ref");
        this.eset = fcfn(ri, "set");
        this.ebak = fcfn(ri, "bak");
        this.eclo = fcfn(ri, "clo");
        this.emain = fcfn(elem.childNodes, "main");
    }

    get main() {
        return this.emain;
    }

    get ref() {
        var t = this;
        return {
            onclick(f = () => {}) {
                t.eref.addEventListener("click", f, true);
            },

            hide(h = true) {
                if (h)
                    t.eref.style.display = "none";
                else
                    t.eref.style.display = "inline-block";
            }
        }
    }

    get set() {
        var t = this;
        return {
            onclick(f = () => {}) {
                t.eset.addEventListener("click", f, true);
            },

            hide(h = true) {
                if (h)
                    t.eset.style.display = "none";
                else
                    t.eset.style.display = "inline-block";
            }
        }
    }

    get bak() {
        var t = this;
        return {
            onclick(f = () => {}) {
                t.ebak.addEventListener("click", f, true);
            },

            hide(h = true) {
                if (h)
                    t.ebak.style.display = "none";
                else
                    t.ebak.style.display = "inline-block";
            }
        }
    }

    get clo() {
        var t = this;
        return {
            onclick(f = () => {}) {
                t.eclo.addEventListener("click", f, true);
            },

            hide(h = true) {
                if (h)
                    t.eclo.style.display = "none";
                else
                    t.eclo.style.display = "inline-block";
            }
        }
    }

    set title(str = "") {
        this.etitle.innerText = str;
    }
}

core = {
    logpanel: new regPanel($("#logp")),
    rankpanel: new regPanel($("#rankp")),
    container: $("#container"),
    plogdata: new Array(),
    prankdata: new Array(),
    flogint: null,
    frankint: null,

    init() {
        console.log("%cSTOP! ✋", "font-size: 72px; font-weight: 900;");
        console.log(
            "%cThis feature is intended for developers. Pasting something here could give strangers access to your account.",
            "font-size: 18px; font-weight: 700;"
        );
        console.log("init...");
        $("#loader").classList.add("done");
        this.file.init();
        this.timer.init();
        this.userprofile.init();
        this.wrapper.init();
        this.problems.init();
        this.fetchlog();
        this.fetchrank();
        this.logpanel.ref.onclick(() => {
            core.fetchlog(true);
        });
        this.rankpanel.ref.onclick(() => {
            core.fetchrank(true);
        });
        core.file.onUploadSuccess = this.fetchlog;
        core.flogint = setInterval(this.fetchlog, 1000);
        core.frankint = setInterval(this.fetchrank, 2000);
    },

    fetchlog(bypass = false) {
        myajax({
            url: "/api/test/logs",
            method: "GET",
        }, function (data) {
            if (comparearray(data, core.plogdata) && !bypass)
                return;

            core.logpanel.main.innerHTML = "";
            out = "<ul class=\"log-item-container\">\n";

            for (var i = 0; i < data.judging.length; i++) {
                out += [
                    "<li class=\"log-item judging\">",
                        "<div class=\"h\">",
                            "<ul class=\"l\">",
                                "<li class=\"t\">" + data.judging[i].lastmodify + "</li>",
                                "<li class=\"n\">" + data.judging[i].name + "</li>",
                            "</ul>",
                            "<t class=\"r\">Đang chấm</t>",
                        "</div>",
                        "<a class=\"d\"></a>",
                    "</li>"
                ].join("\n");
            }

            for (var i = 0; i < data.queues.length; i++) {
                out += [
                    "<li class=\"log-item queue\">",
                        "<div class=\"h\">",
                            "<ul class=\"l\">",
                                "<li class=\"t\">" + data.queues[i].lastmodify + "</li>",
                                "<li class=\"n\">" + data.queues[i].name + "</li>",
                            "</ul>",
                            "<t class=\"r\">Đang chờ</t>",
                        "</div>",
                        "<a class=\"d\"></a>",
                    "</li>"
                ].join("\n");
            }

            for (var i = 0; i < data.logs.length; i++) {
                out += [
                    "<li class=\"log-item\">",
                    "<div class=\"h\">",
                    "<ul class=\"l\">",
                    "<li class=\"t\">" + data.logs[i].lastmodify + "</li>",
                    "<li class=\"n\">" + data.logs[i].name + "</li>",
                    "</ul>",
                    "<t class=\"r\">" + data.logs[i].out + "</t>",
                    "</div>",
                    "<span class=\"d\" onclick=\"core.viewlog(\'" + data.logs[i].url + "\')\"></span>",
                    "</li>"
                ].join("\n");
            }
            out += "</ul>";
            core.logpanel.main.innerHTML = out;
            core.plogdata = data;
        })
    },

    fetchrank(bypass = false) {
        myajax({
            url: "/api/test/rank",
            method: "GET",
        }, function (data) {
            if (comparearray(data, core.prankdata) && !bypass)
                return;

            core.rankpanel.main.innerHTML = "";
            var list = data.list;
            var out = [
                "<table>",
                    "<tr>",
                        "<th>#</th>",
                        "<th>Thí sinh</th>",
                        "<th>Tổng</th>",
            ].join("\n");

            for (var i = 0; i < list.length; i++)
                out += "<th>" + list[i] + "</th>\n";
            out += "</tr>\n";

            var ptotal = 0;
            var rank = 0;

            for (var i = 0; i < data.rank.length; i++) {
                if (ptotal != data.rank[i].total) {
                    ptotal = data.rank[i].total;
                    rank++;
                }

                out += [
                    "<tr>",
                        "<td>" + rank + "</td>",
                        "<td>",
                            "<img class=\"avt\" src=\"/api/avt/get?u=" + data.rank[i].username + "\">",
                            "<t class=\"name\">" + escape_html(data.rank[i].name) + "</t>",
                        "</td>",
                        "<td class=\"number\">" + parseFloat(data.rank[i].total).toFixed(2) + "</td>"
                ].join("\n");

                for (var j = 0; j < list.length; j++)
                    out += "<td class=\"number\">" + parseFloat(data.rank[i].list[list[j]]).toFixed(2) + "</td>\n";
                
                out += "</tr>";
            }
            out += "</table>";
            core.rankpanel.main.innerHTML = out;
            core.prankdata = data;
        });
    },

    viewlog(url) {
        file = url.split("/").pop().replace("viewlog?f=", "");
        myajax({
            url: "/api/test/viewlog",
            method: "GET",
            query: {
                "f": file
            }
        }, function(res) {
            core.wrapper.show(file);
            var out = "<ul class=\"viewlog-container\">\n";
            for (var i = 0; i < res.length; i++) {
                out += "<li>" + escape_html(res[i]) + "</li>\n";
            }
            out += "</ul>";
            core.wrapper.panel.main.innerHTML = out;
        });
    },

    showcp() {
        core.userprofile.toggler.classList.remove("showupanel");
        core.wrapper.show("Admin CPanel");
        core.wrapper.panel.main.innerHTML = "<iframe class=\"cpanel-container\" src=\"config.php\"></iframe>"
    },

    file: {
        dropzone: $("#file_dropzone"),
        state: $("#file_upstate"),
        name: $("#file_name"),
        bar: $("#file_bar"),
        percent: $("#file_perc"),
        size: $("#file_size"),
        panel: new regPanel($("#uploadp")),
        uploadcooldown: 1000,
        onUploadSuccess() {},

        init() {
            this.dropzone.addEventListener("dragenter", this.dragenter, false);
            this.dropzone.addEventListener("dragleave", this.dragleave, false);
            this.dropzone.addEventListener("dragover", this.dragover, false);
            this.dropzone.addEventListener("drop", this.filesel, false);
            this.panel.ref.onclick(this.reset);
            this.panel.title = "Nộp bài";
            this.panel.set.hide();
        },

        reset() {
            core.file.dropzone.classList.remove("hide");
            core.file.panel.title = "Nộp bài";
            core.file.name.innerText = "null";
            core.file.state.innerText = "null";
            core.file.size.innerText = "00/00";
            core.file.percent.innerText = "0%";
            core.file.bar.style.width = "0%";
            core.file.bar.className = "";
        },

        filesel(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");

            var files = e.dataTransfer.files;

            this.classList.add("hide");
            core.file.state.innerText = "Chuẩn bị tải lên " + files.length + " tệp...";
            core.file.size.innerText = "00/00";
            core.file.percent.innerText = "0%";
            core.file.bar.style.width = "0%";
            setTimeout(() => {
                core.file.upload(files);
            }, 1000);
        },

        dragenter(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.add("drag");
        },

        dragleave(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");
        },

        dragover(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            this.classList.add("drag");
        },

        upload(files, i = 0) {
            if (i > files.length - 1) {
                this.reset();
                return;
            }

            this.name.innerText = files[i].name;
            this.state.innerText = "Đang tải lên...";
            this.panel.title = "Nộp bài - Đang tải lên " + (i + 1) + "/" + files.length +"...";
            this.size.innerText = "00/00";
            this.percent.innerText = "0%";
            this.bar.style.width = "0%";
            this.bar.classList.remove("red");

            setTimeout(() => {
                myajax({
                    url: "/api/test/upload",
                    method: "POST",
                    form: {
                        "token": API_TOKEN,
                    },
                    file: files[i],
                }, data => {
                    this.state.innerText = "Tải lên thành công! " + (i + 1) + "/" + files.length;
                    this.onUploadSuccess();
                    setTimeout(() => {
                        this.upload(files, i + 1);
                    }, this.uploadcooldown / 2);
                }, e => {
                    this.size.innerText = e.loaded + "/" + e.total;
                    this.percent.innerText = ((e.loaded / e.total) * 100).toFixed(0) + "%";
                    this.bar.style.width = (e.loaded / e.total) * 100 + "%";
                }, res => {
                    statbar.hide();
                    this.state.innerText = res.description;
                    this.panel.title = "Nộp bài - Đã dừng.";
                    this.bar.classList.add("red");
                })
            }, this.uploadcooldown / 2);
        },
    },

    problems: {
        panel: new regPanel($("#problemp")),
        list: $("#problem_list"),
        name: $("#problem_name"),
        point: $("#problem_point"),
        type: {
            "filename": $("#problem_type_filename"),
            "ext": $("#problem_type_ext"),
            "time": $("#problem_type_time"),
            "inp": $("#problem_type_inp"),
            "out": $("#problem_type_out")
        },
        image: $("#problem_image"),
        description: $("#problem_description"),
        test: $("#problem_test"),

        init() {
            this.panel.set.hide();
            this.panel.bak.hide();
            this.panel.bak.onclick(() => {
                this.list.classList.remove("hide");
                this.panel.title = "Đề bài"
                this.panel.bak.hide();
            })
            this.panel.ref.onclick(f => {
                this.getlist();
            });
            this.getlist();
        },

        getlist() {
            myajax({
                "url": "/api/test/problems/list",
                "method": "GET"
            }, data => {
                this.list.innerHTML = "";
                data.forEach(item => {
                    html = [
                        "<li class=\"item\" onclick=\"core.problems.getproblem(\'" + item.id + "\');\">",
                            "<img class=\"icon\" src=\"" + item.image + "\">",
                            "<ul class=\"title\">",
                                "<li class=\"name\">" + item.name + "</li>",
                                "<li class=\"point\">" + item.point + " điểm</li>",
                            "</ul>",
                        "</li>",
                    ].join("\n");
                    this.list.innerHTML += html;
                })
            })
        },

        getproblem(id) {
            myajax({
                "url": "/api/test/problems/get",
                "method": "GET",
                "query": {
                    "id": id
                }
            }, data => {
                this.name.innerText = data.name;
                this.panel.title = "Đề bài - " + data.name;
                this.point.innerText = data.point + " điểm";
                this.type.filename.innerText = data.id;
                this.type.ext.innerText = data.accept.join(", ");
                this.type.time.innerText = data.time + " giây";
                this.type.inp.innerText = data.type.inp;
                this.type.out.innerText = data.type.out;
                this.image.src = data.image;
                this.description.innerText = data.description;
                testhtml = "";
                data.test.forEach(item => {
                    testhtml += [
                        "<tr>",
                            "<td>" + item.inp + "</td>",
                            "<td>" + item.out + "</td>",
                        "</tr>"
                    ].join("\n");
                })
                this.test.innerHTML = [
                    "<tr>",
                        "<th>Input</th>",
                        "<th>Output</th>",
                    "</tr>"
                ].join("\n") + testhtml;
                this.list.classList.add("hide");
                this.panel.bak.hide(false);
            })
        }
    },

    timer: {
        timepanel: new regPanel($("#timep")),
        state: $("#time_state"),
        time: $("#time_time"),
        bar: $("#time_bar"),
        start: $("#time_start"),
        end: $("#time_end"),
        timedata: Array(),
        interval: null,
        last: 0,

        init() {
            this.timepanel.set.hide();
            this.timepanel.ref.onclick(() => {
                this.fetchtime();
            });
            this.fetchtime(true);
        },

        fetchtime(init = false) {
            myajax({
                url: "/api/test/timer",
                method: "GET",
            }, data => {
                this.timedata = data;
                if (data.during <= 0) {
                    $("#timep").classList.remove("show");
                    clearInterval(this.interval);
                    return;
                }
                if (init) {
                    $("#timep").classList.add("show");
                    this.last = 0;
                    clearInterval(this.interval);
                    this.startinterval();
                }
            });
        },

        startinterval() {
            this.timeupdate();
            this.interval = setInterval(() => {
                this.timedata.time--;
                this.timeupdate();
            }, 1000);
        },

        reset() {
            clearInterval(this.interval);
            this.time.classList.remove("red");
            this.time.classList.remove("green");
            this.time.innerText = "--:--";
            this.bar.style.width = "0%";
            this.start.innerText = "--:--";
            this.end.innerText = "--:--";
            this.state.innerText = "---";
            this.last = 0;
            this.timedata.stage = 0;
        },

        timeupdate() {
            if ((data = this.timedata).time == 0)
                switch (data.stage) {
                    case 1:
                        this.timedata.stage = 2;
                        this.timedata.time = data.during;
                        break;
                    case 2:
                        this.timedata.stage = 3;
                        this.timedata.time = data.offset;
                        break;
                    case 3:
                        this.timedata.stage = 4;
                        break;
                    default:
                        this.reset();
                        break;
                }
            data = this.timedata;
            t = data.time;

            switch(data.stage) {
                case 1:
                    if (this.last == 0)
                        this.last = t;
                    this.time.classList.remove("red");
                    this.time.classList.remove("green");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = ((t)/this.last)*100 + "%";
                    this.start.innerText = parsetime(t).str;
                    this.end.innerText = parsetime(this.last).str;
                    this.state.innerText = "Bắt đầu kì thi sau";
                    break;
                case 2:
                    this.time.classList.remove("red");
                    this.time.classList.add("green");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = (t/data.during)*100 + "%";
                    this.start.innerText = parsetime(t).str;
                    this.end.innerText = parsetime(data.during).str;
                    this.state.innerText = "Thời gian làm bài";
                    break;
                case 3:
                    this.time.classList.remove("green");
                    this.time.classList.add("red");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = (t/data.offset)*100 + "%";
                    this.start.innerText = parsetime(t).str;
                    this.end.innerText = parsetime(data.offset).str;
                    this.state.innerText = "Thời gian bù";
                    break;
                case 4:
                    this.time.classList.remove("green");
                    this.time.classList.remove("red");
                    this.time.innerText = parsetime(t).str;
                    this.bar.style.width = "0%";
                    this.start.innerText = parsetime(t).str;
                    this.end.innerText = "--:--";
                    this.state.innerText = "ĐÃ HẾT THỜI GIAN LÀM BÀI";
                    break;
                default:
                    statbar.change(statbar.type.ERROR, "Lỗi không rõ.");
                    break;
            }
        }
    },

    userprofile: {
        uname: $("#user_name"),
        uavt: $("#user_avt"),
        avt: $("#userp_avt"),
        avtw: $("#userp_avtw"),
        name: $("#userp_name"),
        tag: $("#userp_tag"),
        body: {
            nameform: $("#userp_edit_name_form"),
            passform: $("#userp_edit_pass_form"),
            namepanel: null,
            passpanel: null,
            name: $("#userp_edit_name"),
            pass: $("#userp_edit_pass"),
            npass: $("#userp_edit_npass"),
            renpass: $("#userp_edit_renpass"),
        },
        logoutbtn: $("#userp_logout"),
        toggler: $("#upanel_toggler"),
        userprofile: $("#user_profile"),

        panel: class {
            constructor(elem) {
                if (!elem.classList.contains("panel"))
                    return false;
        
                this.elem = elem;
                this.etitle = fcfn(elem.childNodes, "title");
                this.container = $("#userp_right_panel");
                this.lpanel = $("#userp_left_panel");

                var _this = this;
                this.etitle.addEventListener("click", () => {
                    _this.close();
                })
            }
        
            close() {
                this.elem.classList.remove("show");
                this.container.classList.remove("show");
                this.lpanel.classList.remove("hide");
            }

            show() {
                this.elem.classList.add("show");
                this.container.classList.add("show");
                this.lpanel.classList.add("hide");
            }

            toggle() {
                this.elem.classList.toggle("show");
                this.container.classList.toggle("show");
                this.lpanel.classList.toggle("hide");
            }

            set toggler(e) {
                var _this = this;
                e.addEventListener("click", () => {
                    _this.elem.classList.toggle("show");
                    _this.container.classList.toggle("show");
                    _this.lpanel.classList.toggle("hide");
                });
            }
        
            set title(str = "") {
                this.etitle.innerText = str;
            }
        },

        init() {
            this.avtw.addEventListener("dragenter", this.dragenter, false);
            this.avtw.addEventListener("dragleave", this.dragleave, false);
            this.avtw.addEventListener("dragover", this.dragover, false);
            this.avtw.addEventListener("drop", this.filesel, false);
            this.toggler.addEventListener("click", this.toggle, false);

            this.body.namepanel = new this.panel($("#userp_edit_name_panel"));
            this.body.passpanel = new this.panel($("#userp_edit_pass_panel"));
            this.body.namepanel.toggler = $("#userp_edit_name_toggler");
            this.body.passpanel.toggler = $("#userp_edit_pass_toggler");

            this.body.nameform.addEventListener("submit", function() {
                this.getElementsByTagName("button")[0].disabled = true;
                core.userprofile.changename(core.userprofile.body.name.value);
            }, false)

            this.body.passform.addEventListener("submit", function() {
                this.getElementsByTagName("button")[0].disabled = true;
                core.userprofile.changepass(core.userprofile.body.pass.value, core.userprofile.body.npass.value, core.userprofile.body.renpass.value);
            }, false)

            this.logoutbtn.addEventListener("click", this.logout);
        },

        logout() {
            myajax({
                url: "/api/logout",
                method: "POST",
                form: {
                    "token": API_TOKEN
                }
            }, function() {
                location.reload();
            })
        },

        toggle() {
            core.userprofile.toggler.classList.toggle("active");
            core.userprofile.userprofile.classList.toggle("show");
        },

        reset() {
            core.userprofile.avtw.classList.remove("drop");
            core.userprofile.avtw.classList.remove("load");
            core.userprofile.body.nameform.getElementsByTagName("button")[0].disabled = false;
            core.userprofile.body.passform.getElementsByTagName("button")[0].disabled = false;
            core.userprofile.body.name.value = null;
            core.userprofile.body.pass.value = null;
            core.userprofile.body.npass.value = null;
            core.userprofile.body.renpass.value = null;
        },

        reload(data, m = 0) {
            core.fetchrank(true);
            if (m == 0)
                core.userprofile.uavt.src = core.userprofile.avt.src = data.src;
            else
                core.userprofile.uname.innerText = core.userprofile.name.innerText = data;
        },
        
        changename(name) {
            myajax({
                url: "/api/edit",
                method: "POST",
                form: {
                    "n": name,
                    "token": API_TOKEN
                }
            }, function(res) {
                statbar.change(statbar.type.OK, "Thay đổi thông tin thành công!");
                core.userprofile.reset();
                core.userprofile.reload(res.name, 1);
            }, () => {}, function (res) {
                core.userprofile.reset();
            });
        },

        changepass(pass, npass, renpass) {
            myajax({
                url: "/api/edit",
                method: "POST",
                form: {
                    "p": pass,
                    "np": npass,
                    "rnp": renpass,
                    "token": API_TOKEN
                }
            }, function(res) {
                statbar.change(statbar.type.OK, "Thay đổi thông tin thành công!");
                core.userprofile.reset();
            }, () => {}, function (res) {
                core.userprofile.reset();
            });
        },

        filesel(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");

            var file = e.dataTransfer.files[0];

            this.classList.add("load");
            setTimeout(() => {
                core.userprofile.avtupload(file);
            }, 1000);
        },

        avtupload(file) {
            myajax({
                url: "/api/avt/change",
                method: "POST",
                form: {
                    "token": API_TOKEN,
                },
                file: file,
            }, function (d) {
                core.userprofile.reset();
                core.userprofile.reload(d);
            }, () => {}, function (res) {
                core.userprofile.reset();
            });
        },

        dragenter(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.add("drag");
        },

        dragleave(e) {
            e.stopPropagation();
            e.preventDefault();
            this.classList.remove("drag");
        },

        dragover(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            this.classList.add("drag");
        }

    },

    wrapper: {
        wrapper: $("#wrapper"),
        panel: new regPanel($("#wrapp")),

        init() {
            this.panel.set.hide();
            this.panel.ref.hide();
            this.panel.clo.onclick(this.hide);
        },

        show(title = "") {
            core.wrapper.wrapper.classList.add("show");
            core.wrapper.panel.title = title;
        },

        hide() {
            core.wrapper.wrapper.classList.remove("show");
        }
    }

}