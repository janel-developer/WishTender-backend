// const chai = require('chai');
// chai.use(require('chai-as-promised'));

// const should = chai.should();
// const helper = require('../../../../helper');
// const { expect } = chai;

// const { UserModel } = helper;
// const { validAlias, AliasSchema } = helper;

// const mongoose = require('mongoose');

// const DummyModel = mongoose.model(
//   'DummyModel',
//   new mongoose.Schema(
//     {
//       aliases: [AliasSchema],
//     },
//     { timestamps: { createdAt: 'created_at' } }
//   )
// );
// const DummyRefModel = mongoose.model(
//   'DummyRefModel',
//   new mongoose.Schema(
//     {
//       someProperty: String,
//     },
//     { timestamps: { createdAt: 'created_at' } }
//   )
// );

// // describe('Alias Schema done', async () => {
// //   beforeEach(async () => {
// //     helper.before();
// //     DummyModel.deleteMany({});
// //   });
// //   afterEach(async () => DummyModel.deleteMany({}));
// //   it('should let you create a new user with valid data', async () => {
// //     const user = new DummyModel({ someProperty: 'P' });
// //     const savedUser = await user.save();
// //     // eslint-disable-next-line no-unused-expressions
// //     expect(savedUser.id).to.exist;
// //   });
// // });

// describe('Alias Schema', () => {
//   before(async () => {
//     await helper.before();
//     await DummyModel.deleteMany({});
//     await DummyRefModel.deleteMany({});
//   });
//   after(async () => {
//     await helper.after();
//     await DummyModel.deleteMany({});
//     await DummyRefModel.deleteMany({});
//   });
//   let dummy;
//   context('Create an embedded alias document', () => {
//     it('should return a dummy model with an embedded alias', async () => {
//       dummy = await DummyModel.create({});
//       dummy = await DummyModel.findByIdAndUpdate(
//         dummy._id,
//         {
//           $push: {
//             aliases: validAlias,
//           },
//         },
//         { new: true, useFindAndModify: false }
//       );
//       dummy = await DummyModel.findById(dummy._id);

//       dummy.should.have.property('aliases');
//       dummy.aliases[0].should.have.property('_id');
//     });
//   });

//   context('Add a reference id to the alias document wishlists field', () => {
//     it('should return a dummy ref model with an embedded alias and a reference id to a wishlist', async () => {
//       const dummyRef = await DummyRefModel.create({});
//       dummy.aliases[0].wishlists.push(dummyRef._id);
//       await dummy.save();
//       dummy = await DummyModel.findById(dummy._id);
//       const alias = dummy.aliases[0];
//       const wishlist = dummy.aliases[0].wishlists[0];
//       wishlist._id.toString().should.be.equal(dummyRef._id.toString());
//     });
//   });
// });
