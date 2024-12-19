drop database if exists fitnesstracker;

create database fitnesstracker;

use fitnesstracker;

create table record(
    recordId int not null auto_increment,
    name varchar(45) not null,
    timestamp datetime not null,
    burned_calories int not null,
    training_type varchar(45) not null,
    description text not null,
    primary key (recordId)
);