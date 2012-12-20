/* XMLHttpRequest(JSObject objParameters);
void abort();
DOMString getAllResponseHeaders();
DOMString? getResponseHeader(DOMString header);
void open(DOMString method, DOMString url, optional boolean async, optional DOMString? user, optional DOMString? password);
void overrideMimeType(DOMString mime);
void send();
void send(ArrayBuffer data);
void send(Blob data);
void send(Document data);
void send(DOMString? data);
void send(FormData data);
void setRequestHeader(DOMString header, DOMString value);

onreadystatechange // Function?
readyState // unsigned short
// 0    UNSENT  open()has not been called yet.
// 1   OPENED  send()has not been called yet.
// 2   HEADERS_RECEIVED    send() has been called, and headers and status are available.
// 3   LOADING     Downloading; responseText holds partial data.
// 4   DONE    The operation is complete.

response    // varies
// The response entity body according to responseType, as an 
// ArrayBuffer, Blob, Document, JavaScript object (for "json"), or string. 
// This is null if the request is not complete or was not successful.

responseText //   DOMString
responseText //   DOMString   
// The response to the request as text, 
// or null if the request was unsuccessful or has not yet been sent. Read-only.

responseType //   XMLHttpRequestResponseType  
// Can be set to change the response type. This 
// tells the server what format you want the response to be in.
// "" (empty string)    String (this is the default)
// "arraybuffer"   ArrayBuffer
// "blob"  Blob
// "document"  Document
// "json"  JavaScript object, parsed from a JSON string returned by the server
// "text"  String
responseXML //    Document?
status //  unsigned short
statusText //  DOMString
timeout //    unsigned long
upload  // XMLHttpRequestUpload
// The upload process can be tracked by adding an event listener to upload.
*/




