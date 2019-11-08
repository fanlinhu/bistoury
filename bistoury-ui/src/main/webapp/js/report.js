var proxyUrl;
var treeData = [
    {
        text: "紧凑栈(压缩常见中间件)",
        state: {
            expanded: true
        },
        nodes:
            [
                {
                    selectable: true,
                    text: "runnable state",
                    state: {
                        selected: true
                    }
                },
                {
                    text: "waiting state"
                },
                {
                    text: "blocked state"
                },
                {
                    text: "timed waiting state"
                },
                {
                    text: "all state"
                }
            ]
    },
    {
        text: "完整栈",
        state: {
            expanded: true
        },
        nodes:
            [
                {
                    text: "runnable state"
                },
                {
                    text: "waiting state"
                },
                {
                    text: "blocked state"
                },
                {
                    text: "timed waiting state"
                },
                {
                    text: "all state"
                }
            ]
    }
];

$(document).ready(function () {
    var treeViewObject = $('#svg-tree');
    treeViewObject.treeview({ data: treeData })
        .on('nodeSelected', function (event, data) {
            switch (data.nodeId) {
                case "0.0.0":
                    chooseSvg("runnable", true);
                    break;
                case "0.0.1":
                    chooseSvg("waiting", true);
                    break;
                case "0.0.2":
                    chooseSvg("blocked", true);
                    break;
                case "0.0.3":
                    chooseSvg("timed-waiting", true);
                    break;
                case "0.0.4":
                    chooseSvg("all", true);
                    break;
                case "0.1.0":
                    chooseSvg("runnable", false);
                    break;
                case "0.1.1":
                    chooseSvg("waiting", false);
                    break;
                case "0.1.2":
                    chooseSvg("blocked", false);
                    break;
                case "0.1.3":
                    chooseSvg("timed-waiting", false);
                    break;
                case "0.1.4":
                    chooseSvg("all", false);
                    break;
            }
        });
    init();
});

function init() {
    var info = searchAnalysisInfo(getProfilerId());
    if (info == null) {
        bistoury.error("获取性能分析的信息失败");
        return;
    }
    var profiler = info.profiler;
    $("#start_time").html("开始时间: " + profiler.startTime)
    $("#duration").html("实际性能分析时长:" + info.duration + "s")
    $("#default_duration").html("预设性能分析时长:" + profiler.duration + "s");
    $("#default_frequency").html("预设性能分析间隔:" + profiler.frequency + "ms");
    var proxy = info.proxyInfo;
    proxyUrl = proxy.ip + ":" + proxy.tomcatPort;
    chooseSvg("runnable", true);
}


function chooseSvg(state, isCompact) {
    var prefix = "";
    if (isCompact) {
        prefix = "filter-"
    }

    var url = "/profiler/download.do";
    var fileName = prefix + chooseSvgFile(state);
    var profilerId = getProfilerId();
    url = url + "?profilerId=" + profilerId + "&svgName=" + fileName + "&proxyUrl=" + proxyUrl;

    var embedHtml = ' <embed id="svg-file" src="' + url + '"/>';
    $(".svg-page-content").html(embedHtml)
}

function chooseSvgFile(state) {
    switch (state) {
        case "runnable":
            return "runnable-traces.svg";
        case "waiting":
            return "waiting-traces.svg";
        case "blocked":
            return "blocked-traces.svg";
        case "timed-waiting":
            return "timed-waiting-traces.svg";
        case "all":
            return "all-state-traces.svg";
    }
}

function getProfilerId() {
    return getParam("profilerId");
}

function getParam(key) {
    var url = new URL(location.href);
    return url.searchParams.get(key);
}

function searchAnalysisInfo(profilerId) {
    var profilerFileVo;
    $.ajax({
        "url": "/profiler/analysis/info.do",
        "type": "get",
        "dataType": 'JSON',
        async: false,
        "data": {
            profilerId: profilerId
        },
        success: function (ret) {
            if (ret.status === 0) {
                profilerFileVo = ret.data;
            } else {
                bistoury.error("获取性能分析的火焰图信息失败");
            }
        }
    })
    return profilerFileVo;
}