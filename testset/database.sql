drop database smart_link_ICO;

create database smart_link_ICO;
use smart_link_ICO;
create table kyc (id_kyc varchar(255), addr_type ENUM('USD','EUR','BTC','ETH','XTZ'), sender_addr varchar(255), reception_addr varchar(255), mail varchar(255), primary key (sender_addr));

create table blockchain (id int NOT NULL AUTO_INCREMENT, sender_addr varchar(255) not null references kyc(sender_addr), amount float(18,8), price_euro float(18,8), date_tx datetime, primary key (id));

