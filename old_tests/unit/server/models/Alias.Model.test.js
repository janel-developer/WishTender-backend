const chai = require('chai');
chai.use(require('chai-as-promised'));

const should = chai.should();
const helper = require('../../../helper');
const { expect } = chai;

const { AliasModel, validAlias, UserModel, validUser } = helper;

const mongoose = require('mongoose');

const DummyParentModel = mongoose.model(
  'DummyParentModel',
  new mongoose.Schema(
    {
      aliases: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'wishlists',
        },
      ],
    },
    { timestamps: { createdAt: 'created_at' } }
  )
);

const DummyRefModel = mongoose.model(
  'DummyRefModel',
  new mongoose.Schema(
    {
      someProperty: String,
    },
    { timestamps: { createdAt: 'created_at' } }
  )
);

describe('Alias Model', () => {
  let user;
  before(async () => {
    await helper.before();
    user = await UserModel.create(validUser);
    await DummyRefModel.deleteMany({});
  });
  after(async () => {
    await helper.after();
    await DummyRefModel.deleteMany({});
  });
  let alias;
  context('Create an alias document', () => {
    it('should make an alias with user id ref', async () => {
      validAlias.user = user._id;
      alias = await AliasModel.create(validAlias);
      user.aliases.push(alias._id);
      user = await user.save();
      const id = user.aliases[0]._id.toString();
      id.should.be.equal(alias._id.toString());
    });

    it('should not work if user not exist', async () => {
      const inValidAlias = {
        user: '5f6e2ca52671e71c5e41a427',
        handle: 'funpoop',
        aliasName: 'George',
      };
      let error;
      try {
        alias = await AliasModel.create(inValidAlias);
      } catch (err) {
        error = err;
        console.log(err.message);
      }

      expect(error).to.be.an('Error');
    });
  });

  context('Add a wishlist (dummy object)', () => {
    it('should return a user with a object dummyRef', async () => {
      const dummyRef = await DummyRefModel.create({});
      alias.wishlists.push(dummyRef._id);
      await alias.save();
      alias = await AliasModel.findById(alias._id);
      const wishlist = alias.wishlists[0];
      wishlist._id.toString().should.be.equal(dummyRef._id.toString());
    });
  });
});
