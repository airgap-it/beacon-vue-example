drop database smart_link_ICO;

create database smart_link_ICO;
use smart_link_ICO;

create table kyc (
    id_kyc varchar(255), 
    addr_type ENUM('USD','EUR','BTC','ETH','XTZ'), 
    sender_addr varchar(255), 
    reception_addr varchar(255), 
    mail varchar(255),
    is_smak_sent boolean, 
    primary key (sender_addr)
);

create table blockchain (
    tx_hash varchar(255) NOT NULL, 
    amount float(18,8), 
    price_euro float(18,8), 
    tx_date datetime, 
    primary key (tx_hash)
);

create table transactions (
    tx_hash varchar(255) not null references blockchain(tx_hash),
    sender_addr varchar(255) not null references kyc(sender_addr), 
    primary key (tx_hash, sender_addr)
);

