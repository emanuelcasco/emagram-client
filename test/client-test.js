'use strict'

const test = require('ava')
const nock = require('nock')
const emagram = require('../')
const fixtures = require('./fixtures')

let options = {
  endpoints: {
    pictures: 'http://emagram.test/picture',
    users: 'http://emagram.test/user',
    auth: 'http://emagram.test/auth'
  }
}

test.beforeEach(t => {
  t.context.client = emagram.createClient(options)
})

test('getPicture', async t => {
  const client = t.context.client

  let image = fixtures.getImage()

  nock(options.endpoints.pictures)
    .get(`/${image.publicId}`)
    .reply(200, image)

  let result = await client.getPicture(image.publicId)

  t.deepEqual(image, result)
})

test('savePicture', async t => {
  const client = t.context.client

  let token = 'xxx-xxxx-xxx'
  let image = fixtures.getImage()

  let newImage = {
    src: image.src,
    description: image.description
  }

  nock(options.endpoints.pictures, {
    reqheaders: {
      'Authorization': `Bearer ${token}`
    }
  })
    .post('/', newImage)
    .reply(201, image)

  let result = await client.savePicture(newImage, token)

  t.deepEqual(result, image)
})

test('likePicture', async t => {
  const client = t.context.client

  let image = fixtures.getImage()
  image.liked = true
  image.likes += 1

  nock(options.endpoints.pictures)
    .post(`/${image.publicId}/like`)
    .reply(200, image)

  let result = await client.likePicture(image.publicId)

  t.deepEqual(image, result)
})

test('listPictures', async t => {
  const client = t.context.client

  let images = fixtures.getImages(5)

  nock(options.endpoints.pictures)
    .get('/list')
    .reply(200, images)

  let result = await client.listPictures()

  t.deepEqual(images, result)
})

test('listPicturesByTag', async t => {
  const client = t.context.client

  let images = fixtures.getImages(5)
  let tag = 'emagram'

  nock(options.endpoints.pictures)
    .get(`/tag/${tag}`)
    .reply(200, images)

  let result = await client.listPicturesByTag(tag)

  t.deepEqual(images, result)
})

test('saveUser', async t => {
  const client = t.context.client

  let user = fixtures.getUser()
  let newUser = {
    username: user.username,
    name: user.name,
    email: 'user@emagram.com',
    password: 'em4gram'
  }

  nock(options.endpoints.users)
    .post('/', newUser)
    .reply(201, user)

  let result = await client.saveUser(newUser)

  t.deepEqual(result, user)
})

test('getUser', async t => {
  const client = t.context.client

  let user = fixtures.getUser()

  nock(options.endpoints.users)
    .get(`/${user.username}`)
    .reply(200, user)

  let result = await client.getUser(user.username)

  t.deepEqual(user, result)
})

test('auth', async t => {
  const client = t.context.client

  let token = 'xxx-xxxx-xxx'
  let credentials = {
    username: 'emanuel',
    password: 'em4gram'
  }

  nock(options.endpoints.auth)
    .post('/', credentials)
    .reply(200, token)

  let result = await client.auth(credentials.username, credentials.password)

  t.deepEqual(result, token)
})

test('client', t => {
  const client = emagram.createClient()

  t.is(typeof client.getPicture, 'function')
  t.is(typeof client.savePicture, 'function')
  t.is(typeof client.likePicture, 'function')
  t.is(typeof client.listPictures, 'function')
  t.is(typeof client.listPicturesByTag, 'function')
  t.is(typeof client.saveUser, 'function')
  t.is(typeof client.getUser, 'function')
  t.is(typeof client.auth, 'function')
})
