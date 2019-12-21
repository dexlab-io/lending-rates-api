# lending-rates-api
Microservice to keep track of lending / borrowing rates across some services (dydx, compound, bzx) with some endpoints to query this data.

## Development
We are using tslint, please install it in your IDE. If using Visual Studio Code: https://marketplace.visualstudio.com/items?itemName=eg2.tslint

`npm install && npm run dev`

## Testing
`npm install && npm test`

## Seed the DB
`npm run script`

## Endpoints
- [GET] /rates
- [GET] /rates/:tokenSymbol
- [GET] /rates/:tokenSymbol/:provider
- [GET] /stock/:ticker `daily`
- [GET] /stock/:ticker/weekly `weekly`
- [GET] /stock/:ticker/monthly `monthly`

## Run
`npm install && npm build && npm start`