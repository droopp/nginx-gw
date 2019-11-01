

function makeRequest(r) {

    var func;
    var hs = {};
    var h, rs, res_code, res_body;
    
    if (r.uri.search("^/api/(v.|v.\..)/") == 0){
    	func = r.uri.split("/")[3];
    }else{
        func = r.uri.split("/")[2];
    };
 
    for (h in r.headersIn) {
        hs[h] = r.headersIn[h];
    };

    var data = {"uri": r.uri, 
                "headers": hs, 
                "args": getAllUrlParams(r.variables.args), 
                "data": r.requestBody};

    if (r.method == 'GET'){
       data["method"] =  "get";

    }else if (r.method == 'POST'){
       data["method"] =  "post";

    }else if (r.method == 'PUT'){
       data["method"] =  "put";

    }else if (r.method == 'DELETE'){
       data["method"] =  "delete";

    }else if (r.method == 'PATCH'){
       data["method"] =  "patch";

    };
 
    function done(res) {

       if (res.status == 200){
           rs = JSON.parse(res.responseBody);
           res_code = rs.response_code;
           res_body = rs.response_body;

           if (res_code==undefined){
              res_code = res.status;
              res_body = res.responseBody;
           };

       }else {
           res_code = res.status;
           res_body = res.responseBody;
       };

       r.return(res_code, res_body);
    };

    r.subrequest('/internal/api/v1/' + func, { method: 'POST', body: JSON.stringify(data)} , done);

}

function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      if (typeof paramValue === 'string') paramValue = paramValue.toLowerCase();

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {

        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string'){
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}

