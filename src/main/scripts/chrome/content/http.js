function httpGET(url) {
  try {
      var httpRequest = new XMLHttpRequest();
  } catch (e) {
          error('Error creating the connection!');

      return false;
  }

  try {
      httpRequest.open("GET", url, false);
      httpRequest.send(null);
  } catch (e){
      error('Connection error sending the messaga: '+e);
      return false;
  }

  switch(httpRequest.readyState) {
    case 1,2,3:
        error('Response error from the server: ' + httpRequest.status);
        return false;

    case 4:
        if(httpRequest.status !=200) {
          error('Response error from the server: ' + httpRequest.status);
          return false;
        } else {
          var response = httpRequest.responseText;
        }
    break;
  }

  return response;
}