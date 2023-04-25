require('dotenv').config();
const Database = require('dbcmps369');
const bcrypt = require('bcryptjs');

class ContactDB {
    constructor() {
        this.db = new Database();
    }

    async initialize() {
        await this.db.connect();
        
        await this.db.schema('Contact', [
            { name: 'ID', type: 'INTEGER' },
            { name: 'First_Name', type: 'TEXT' },
            { name: 'Last_Name', type: 'TEXT' },
            { name: 'Address', type: 'TEXT' },
            { name: 'Phone_Number', type: 'TEXT' },
            { name: 'Email_Address', type: 'TEXT' },
            { name: 'Title', type: 'TEXT' },
            { name: 'Contact_By_Phone', type: 'INTEGER' },
            { name: 'Contact_By_Email', type: 'INTEGER' },
            { name: 'Contact_By_Mail', type: 'INTEGER' },
            { name: 'Latitude', type: 'REAL' },
            { name: 'Longitude', type: 'REAL' }
        ], 'ID');

        await this.db.schema('Users', [
            { name: 'ID', type: 'INTEGER' },
            { name: 'First_Name', type: 'TEXT' },
            { name: 'Last_Name', type: 'TEXT' },
            { name: 'Username', type: 'TEXT' },
            { name: 'Password', type: 'TEXT' }
        ], 'ID');

        //Add in the cmps369 account if it doesn't already exist.
        const username = 'cmps369';
        const password = 'rcnj';

        const user = await this.findUserByUsername(username);

        if(user === undefined) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);

            await this.createAccount({
                'First_Name': 'CMPS369',
                'Last_Name': 'Account',
                'Username': username,
                'Password': hash
            });
        }
    }

    async createContact(person) {
        const id = await this.db.create('Contact', [
            { column: 'First_Name', value: person.first },
            { column: 'Last_Name', value: person.last },
            { column: 'Address', value: person.address },
            { column: 'Phone_Number', value: person.phone },
            { column: 'Email_Address', value: person.email },
            { column: 'Title', value: person.title },
            { column: 'Contact_By_Phone', value: person.contact_by_phone !== undefined ? true : false },
            { column: 'Contact_By_Email', value: person.contact_by_email !== undefined ? true : false },
            { column: 'Contact_By_Mail', value: person.contact_by_mail !== undefined ? true : false},
            { column: 'Latitude', value: person.latitude },
            { column: 'Longitude', value: person.longitude }
        ]);
        
        return id;
    }

    async deleteContact(id) {
        await this.db.delete('Contact', [{ column: 'ID', value: id}]);
    }

    async updateContact(id, person) {
        await this.db.update('Contact', [
            { column: 'First_Name', value: person.first },
            { column: 'Last_Name', value: person.last },
            { column: 'Address', value: person.address },
            { column: 'Phone_Number', value: person.phone },
            { column: 'Email_Address', value: person.email },
            { column: 'Title', value: person.title },
            { column: 'Contact_By_Phone', value: person.contact_by_phone !== undefined ? true : false },
            { column: 'Contact_By_Email', value: person.contact_by_email !== undefined ? true : false },
            { column: 'Contact_By_Mail', value: person.contact_by_mail !== undefined ? true : false},
            { column: 'Latitude', value: person.latitude },
            { column: 'Longitude', value: person.longitude }
            ],
            [{ column: 'ID', value: id}]
        );
    }

    async createAccount(account) {
        const id = await this.db.create('Users', [
            { column: 'First_Name', value: account.First_Name },
            { column: 'Last_Name', value: account.Last_Name },
            { column: 'Username', value: account.Username },
            { column: 'Password', value: account.Password }
        ]);
        return id;
    }

    async findContactByID(id) {
        const contactInfo = await this.db.read('Contact', [{ column: 'ID', value: id}]);
        if (contactInfo.length > 0) return contactInfo[0];
        else {
            return undefined;
        }
    }

    async findUserByID(id) {
        const user = await this.db.read('Users', [{ column: 'ID', value: id }]);
        if (user.length > 0) return user[0];
        else {
            return undefined;
        }
    }

    async findUserByUsername(username) {
        const user = await this.db.read('Users', [{ column: 'Username', value: username}]);
        if (user.length > 0) return user[0];
        else {
            return undefined
        }
    }

    async getContacts() {
        const contacts = await this.db.read('Contact', []);
        return contacts;
    }
    
}

module.exports = ContactDB;