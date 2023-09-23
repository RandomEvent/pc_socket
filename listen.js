var EventSource = require("eventsource");
const xid = process.env.xid;
const axios = require('axios');
const link = `https://horizon-testnet.stellar.org`;

const ReadCursor = async(xid) => {
    const url = `${link}/accounts/${xid}/transactions/?limit=1&order=desc&include_failed=false`;
    try {
        let response = await axios.get(url);
        if (response.data) {
            let responseJson = await response.data;
            const links = responseJson._links.prev.href;
            const cursor = links.split("cursor=")[1].split("&include_failed=false")[0].toString();
            return cursor;
        }
    } catch (err) {
        console.error('cannot find account');
        return null;
    };
};

const startEventListen = async(fn = async(result) => {
    console.log("New update");
    console.log(result.id);
    console.log(result.created_at);
}) => {
    const cursor = await ReadCursor(xid);
    var es = new EventSource(
        `https://horizon-testnet.stellar.org/accounts/${xid}/payments?cursor=${cursor}`,
    );
    es.onmessage = function(message) {
        var result = message.data ? JSON.parse(message.data) : message;
        fn(result);
    };
};


if (require.main === module) {
    (async() => {
        await startEventListen();

    })();
};

module.exports = {
    startEventListen
};