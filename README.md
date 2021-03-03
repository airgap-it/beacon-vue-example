# Node js ico app 
[WIP]

## Project setup
``` bash
npm install
```

## Run dev environment

Be sure to have MySQL installed. Enter the host, user, password and database name in the develoment.env file under /config.

### Fetch transactions received
Create a local env file called local.env under /config by copy/pasting the development.env file.
Enter the BTC, ETH and XTZ addresses you want to fetch transactions from and also your Etherscan token in the local.env file.
**If you are willing to push code to this repo, do not enter your addresses and token in the development.env file as it is not in the .gitignore**

Then you can run :
``` bash
export NODE_ENV=local && npm run fetch
```

### Batch calls
``` bash
export NODE_ENV=development && npm run batch
```

### Originate contract
``` bash
export NODE_ENV=development && originate
```

### Export database data to csv
``` bash
npm rune export_dev
```