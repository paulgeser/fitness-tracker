drop database if exists activetrack;

create database activetrack;

use activetrack;

create table record(
    record_id int not null auto_increment,
    name varchar(45) not null,
    timestamp datetime not null,
    burned_calories int not null,
    training_type ENUM('outdoor', 'indoor') not null,
    description text not null,
    primary key (record_id)
);