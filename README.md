# LOBSTER

Hello Eth Lisbon 2022


### How to run

Install dependencies:
```bash
npm install
```

Run the nodemon server:
```bash
npm run server
```


### cURLs

create an account for client 1
```bash
curl -v -X POST "http://localhost:3000/account/1" \
	-H "Content-Type: application/json" \
	-d '{"userId": 99}'

curl -v -X POST "https://lobster-api-ethlisbon.herokuapp.com/account/1" \
	-H "Content-Type: application/json" \
	-d '{"userId": 999}'
```


mint an nft of collection 7 from client 1 to user 1
```bash
curl -v -X POST "https://lobster-api-ethlisbon.herokuapp.com/nft/collection/1/7" \
	-H "Content-Type: application/json" \
	-d '{"userId": 1, "ipfsURIKey": 3}'
```

transfer nft token id X from client 1 + user 1 to toAddress
```bash
curl -v -X PUT "https://lobster-api-ethlisbon.herokuapp.com/nft/collection/7" \
	-H "Content-Type: application/json" \
	-d '{"clientId": 1, "tokenId": , "userId": 1, "toAddress": "......"}'
```

export assets from client 1+user 1 to toAddress
```bash
curl -v -X POST "https://lobster-api-ethlisbon.herokuapp.com/account/export/1/1" \
	-H "Content-Type: application/json" \
	-d '{"toAddress": "......"}'
```
