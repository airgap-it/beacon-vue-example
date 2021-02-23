create database smart_link_ICO;

create table kyc (id_kyc varchar(255), type ENUM('USD','EUR','BTC','ETH','XTZ'), adresse_envoi varchar(255), adresse_reception varchar(255), mail varchar(20), primary key (adresse_envoi));

create table blockchain (id int NOT NULL AUTO_INCREMENT, adresse varchar(255) not null references kyc(adresse_envoi), montant float(18,8), cours_euro float(18,8), date_tx datetime, primary key (id));

