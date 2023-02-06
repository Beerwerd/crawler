### Product Crawler

Manufacturer product parser. Moves through manufacturer website and scraps products.

Uses [bull](https://github.com/OptimalBits/bull) queue to run crawler on separated processes

Swagger docs are available on link [/api-docs/](). 

Openapi JSON documentation can be found by path: `/docs/openapi.json`. 

## How to run

### require docker and docker-compose installed
run script
```shell
./scripts/first-start.sh
```

## API endpoints:

```
GET /api/manufacturers
```
all available manufacturers 

```
GET /api/manufacturers/{{manufacturerId}}/products
```
all parsed products (without pagination)

```
PATCH /api/manufacturers/{{manufacturerId}}/parsing
```
run parsing for manufacturer if not parsed yet or if parsed with error.

Add `{ "parse": true }` body params to force parsing.

```
GET /api/products/{{productId}}
```
get full product information. Lazy parsing. Returns parsing information if parsing in progress. 

```
GET /api/parsing/{{parsingId}}
```
get parsing information. returns parsed data (manufacturer or product) if parsing completed 


