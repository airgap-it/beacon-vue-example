# Test set for local database
## Init database
The command lines to init the database are located in the `database.sql` file. In order to execute them in mysql, run:
``` bash
source <PATH_TO_PROJECT>/testset/database.sql

```
where `<PATH_TO_PROJECT>` is the path to the ICO project location on your computer. 

## Populate the database
There are three files to populate the database, each one named after its own table: blockchain, kyc and transactions. 
In order to insert the data to its corresponding table, please run the following commands:

**Load kyc table:**
``` sql
LOAD DATA  INFILE '<PATH_TO_PROJECT>/kyc.csv' INTO TABLE kyc FIELDS TERMINATED BY ',' optionally enclosed by '"' LINES TERMINATED BY '\r\n' IGNORE 1 ROWS (id_kyc, addr_type, sender_addr, reception_addr, mail, is_smak_sent);
```

**Load blockchain table:**
```sql
LOAD DATA  INFILE '<PATH_TO_PROJECT>/blockchain.csv' INTO TABLE blockchain FIELDS TERMINATED BY ',' optionally enclosed by '"' LINES TERMINATED BY '\r\n' IGNORE 1 ROWS (tx_hash, amount, price_dollar, tx_date);

```

**Load transactions table:**
```sql
LOAD DATA  INFILE '<PATH_TO_PROJECT>/transactions.csv' INTO TABLE transactions FIELDS TERMINATED BY ',' optionally enclosed by '"' LINES TERMINATED BY '\r\n' IGNORE 1 ROWS (sender_addr,tx_hash);

```

## Debug
If you have the following error: 
``` 
ERROR 1290 (HY000): The MySQL server is running with the --secure-file-priv option so it cannot execute this statement
```

Please, move your .csv files into the folder `/var/lib/mysql-files/` and remplace <PATH_TO_PROJECT> by `/var/lib/mysql-files/`.