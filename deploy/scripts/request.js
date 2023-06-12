/*global exports, encodeURIComponent, server, __plugin, setTimeout*/
function paramsToString(params) {
    var result = '',
        paramNames = [],
        i;
    for (i in params) {
        paramNames.push(i);
    }
    for (i = 0; i < paramNames.length; i++) {
        result += paramNames[i] + '=' + encodeURIComponent(params[paramNames[i]]);
        if (i < paramNames.length - 1) result += '&';
    }
    return result;
}
function invokeNow(fn) {
    fn();
    return;
}
function invokeLater(fn) {
    setTimeout(fn, 20);
    return;
}
exports.request = function (request, callback) {
    invokeLater(function () {
        var url, paramsAsString, conn, requestMethod;
        if (typeof request === 'string') {
            url = request;
            requestMethod = 'GET';
        } else {
            url = request.url;
            paramsAsString = paramsToString(request.params);
            if (request.method) {
                requestMethod = request.method;
            } else {
                requestMethod = 'GET';
            }
            if (requestMethod == 'GET' && request.params) {
                // append each parameter to the URL
                url = request.url + '?' + paramsAsString;
            }
        }
        conn = new java.net.URL(url).openConnection();
        conn.requestMethod = requestMethod;
        conn.doOutput = true;
        conn.instanceFollowRedirects = false;

        if (conn.requestMethod == 'POST') {
            conn.doInput = true;
            // put each parameter in the outputstream
            conn.setRequestProperty(
                'Content-Type',
                'application/x-www-form-urlencoded'
            );
            conn.setRequestProperty('charset', 'utf-8');
            conn.setRequestProperty('Content-Length', '' + paramsAsString.length);
            conn.useCaches = false;
            var wr = new java.io.DataOutputStream(conn.getOutputStream());
            wr.writeBytes(paramsAsString);
            wr.flush();
            wr.close();
        }
        var rc = conn.responseCode;
        var response;
        var stream;
        if (rc == 200) {
            stream = conn.getInputStream();
            response = new java.util.Scanner(stream).useDelimiter('\\A').next();
        }
        invokeNow(function () {
            callback(rc, response);
        });
    });
};