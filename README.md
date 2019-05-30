# lending-rates-api
Typescript microservice to keep track of lending / borrowing rates across some services (dydx, compound, bzx) with some endpoints to query this data.

## Development
We are using tslint, please install it in your IDE. If using Visual Studio Code: https://marketplace.visualstudio.com/items?itemName=eg2.tslint

`npm install && npm run dev`

## Testing
`npm install && npm test`

## Endpoints
- [GET] /rates
- [GET] /rates/:tokenSymbol
- [GET] /rates/:tokenSymbol/:provider