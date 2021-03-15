drop database smart_link_ICO;

create database smart_link_ICO;
use smart_link_ICO;

create table kyc (
    id_kyc varchar(255), 
    addr_type ENUM('USD','EUR','BTC','ETH','XTZ'), 
    sender_addr varchar(255), 
    reception_addr varchar(255), 
    mail varchar(255),
    is_smak_sent varchar(255), 
    primary key (sender_addr)
);

create table blockchain (
    tx_hash varchar(255) NOT NULL, 
    amount varchar(255), 
    price_dollar varchar(255), 
    tx_date int(100),
    price_date int(100),
    primary key (tx_hash)
);

create table transactions (
    sender_addr varchar(255) not null references kyc(sender_addr), 
    tx_hash varchar(255) not null references blockchain(tx_hash),
    primary key (tx_hash, sender_addr)
);

