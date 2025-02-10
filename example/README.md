## Example

1. First, create the collection, you can follow this link:  https://playground.bnb.glacier.io/


2. Next, set the environment variable as follows:

``` typescript
process.env.GLACIERDB_ENDPOINT=https://greenfield.onebitdev.com/glacier-gateway/
process.env.GLACIERDB_NAMESPACE='your namespace'
process.env.GLACIERDB_DATASET='your dataset'
process.env.GLACIERDB_COLLECTION='your collection'
process.env.GLACIERDB_PRIVATE_KEY='your private key'
process.env.GLACIERDB_MODELNAME='your model name'
process.env.OPENAI_API_KEY='your openai api key'
```


3. Last, run the following commands:

```
npm install
npm run start
```