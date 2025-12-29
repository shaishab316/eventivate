# [1.13.0](https://github.com/shaishab316/getavails-server/compare/v1.12.0...v1.13.0) (2025-12-29)


### Features

* Add endpoints to retrieve new agents and artists, including exclusion logic ([f77b813](https://github.com/shaishab316/getavails-server/commit/f77b8132b6029a4f0af9a34f2506f5935ef98b8d))
* Add functionality to retrieve an event by ID ([d8d45bb](https://github.com/shaishab316/getavails-server/commit/d8d45bb1dceae517d35f8d15e6308c029fb2619d))
* Add mark as complete functionality for offers and update validations ([a3b00b8](https://github.com/shaishab316/getavails-server/commit/a3b00b842a26df9ca0d7c1e97682bf131b047eae))
* Add venue endpoints and related entities to agent offers ([d8d5623](https://github.com/shaishab316/getavails-server/commit/d8d5623e78eeaea9fea8a81666a2c09a484e6b7d))
* Allow organizers to mark events as completed ([d7bf349](https://github.com/shaishab316/getavails-server/commit/d7bf349382cb0705a76cd2a02be3c771f5cdb773))
* Enhance offer management with acceptance functionality and validation ([34cfeba](https://github.com/shaishab316/getavails-server/commit/34cfeba971f79f49a0a405f04cf6b7311d915f85))
* Implement admin mail management and refactor blog validation ([dae9fe6](https://github.com/shaishab316/getavails-server/commit/dae9fe63aaa6cb37f38eb73c5d5914b3db540209))
* Implement daily log rotation and update .gitignore ([b1f0b31](https://github.com/shaishab316/getavails-server/commit/b1f0b317060e8c609170905046c09513f83503fa))
* Implement getAllOffers functionality with pagination and validation ([88c585e](https://github.com/shaishab316/getavails-server/commit/88c585e40afa5393af96572dc842dbc25e81b76b))
* Implement mail module and integrate with admin routes ([3d45529](https://github.com/shaishab316/getavails-server/commit/3d45529fb30bd70ccaa453f6abb29ebeeb0d46e3))
* Implement mail retrieval by ID and refactor subscriptions ([1713ef2](https://github.com/shaishab316/getavails-server/commit/1713ef2ff6c8741efbb532804161a421965e597f))
* Implement offer assignment functionality and update auth middleware ([65ff882](https://github.com/shaishab316/getavails-server/commit/65ff8821cab11a46947e14867f283c247d5b3e1b))
* Implement offer management with CRUD operations and validation ([9b7568b](https://github.com/shaishab316/getavails-server/commit/9b7568b0d3019679efcc477ac62d594338886d23))
* Implement organizer get sold tickets functionality ([eef346b](https://github.com/shaishab316/getavails-server/commit/eef346b7a35f73fdd9d5b69fb502f87b04a4675e))
* Implement per-template compilation cache for Handlebars MJML ([fe434a1](https://github.com/shaishab316/getavails-server/commit/fe434a11ca51885197a0d2b200140dc921bd5180))
* Include location in ticket fetch and improve user deletion ([36d2834](https://github.com/shaishab316/getavails-server/commit/36d2834d8bf9f9687adb963ed46d47ef8b8b6148))
* Rename `all` router to `free` and protect upcoming events route ([ee5a3c9](https://github.com/shaishab316/getavails-server/commit/ee5a3c927724c7042fd7b49dc5365a6b0bdbf173))
* Replace individual rate limiters with a unified auth rate limiter across authentication routes ([a69401e](https://github.com/shaishab316/getavails-server/commit/a69401e0f2d23828d31b9d53b4cc5ab42d695ff9))
* Update completeEvent endpoint to use request body for event ID ([71e0260](https://github.com/shaishab316/getavails-server/commit/71e02609c06701b047b9bf5fd6f60614fbe0ec23))
* Update offer acceptance logic and add location validation for users ([27ff70b](https://github.com/shaishab316/getavails-server/commit/27ff70bf9fb68175e868efd139e8ac6c5816839d))
* Update offer model and validations to include date field ([a340292](https://github.com/shaishab316/getavails-server/commit/a340292343daba8c7d16f2681ea7fc33ed2c94cc))
* Upgrade Prisma to v7, enable ESM, and update schema ([8d3ee64](https://github.com/shaishab316/getavails-server/commit/8d3ee644c5b90946c42c4268e2c887f3babe7328))

# [1.13.0](https://github.com/shaishab316/getavails-server/compare/v1.12.0...v1.13.0) (2025-11-20)


### Features

* Add venue endpoints and related entities to agent offers ([d8d5623](https://github.com/shaishab316/getavails-server/commit/d8d5623e78eeaea9fea8a81666a2c09a484e6b7d))
* Allow organizers to mark events as completed ([d7bf349](https://github.com/shaishab316/getavails-server/commit/d7bf349382cb0705a76cd2a02be3c771f5cdb773))
* Implement daily log rotation and update .gitignore ([b1f0b31](https://github.com/shaishab316/getavails-server/commit/b1f0b317060e8c609170905046c09513f83503fa))
* Implement mail module and integrate with admin routes ([3d45529](https://github.com/shaishab316/getavails-server/commit/3d45529fb30bd70ccaa453f6abb29ebeeb0d46e3))
* Implement organizer get sold tickets functionality ([eef346b](https://github.com/shaishab316/getavails-server/commit/eef346b7a35f73fdd9d5b69fb502f87b04a4675e))
* Include location in ticket fetch and improve user deletion ([36d2834](https://github.com/shaishab316/getavails-server/commit/36d2834d8bf9f9687adb963ed46d47ef8b8b6148))
* Rename `all` router to `free` and protect upcoming events route ([ee5a3c9](https://github.com/shaishab316/getavails-server/commit/ee5a3c927724c7042fd7b49dc5365a6b0bdbf173))
* Update completeEvent endpoint to use request body for event ID ([71e0260](https://github.com/shaishab316/getavails-server/commit/71e02609c06701b047b9bf5fd6f60614fbe0ec23))
* Upgrade Prisma to v7, enable ESM, and update schema ([8d3ee64](https://github.com/shaishab316/getavails-server/commit/8d3ee644c5b90946c42c4268e2c887f3babe7328))

# [1.12.0](https://github.com/shaishab316/getavails-server/compare/v1.11.0...v1.12.0) (2025-11-16)


### Features

* Handle Stripe subscription lifecycle events via webhooks ([514fa79](https://github.com/shaishab316/getavails-server/commit/514fa7936c6652c49e02f939a08f8f4f585dba05))
* Implement subscription feature with Stripe integration ([7eb4dd6](https://github.com/shaishab316/getavails-server/commit/7eb4dd6e724d6ff2e4623e3363b5e5a1ec8ca01e))

# [1.11.0](https://github.com/shaishab316/getavails-server/compare/v1.10.0...v1.11.0) (2025-11-16)


### Features

* Add endpoint to retrieve users with pagination and search ([5fd59b5](https://github.com/shaishab316/getavails-server/commit/5fd59b558b7c0e088c1c4846bab903f65dd62fde))
* Enable VSCode debugging and sequential ticket numbering ([599ee17](https://github.com/shaishab316/getavails-server/commit/599ee1799746d21d5263e64943d50d1448e48c7b))
* Enhance dev workflow and server config, fix chat list, update user omit ([c675767](https://github.com/shaishab316/getavails-server/commit/c675767a2e65387249d26213b00e0e1df456a68a))
* Implement Blog module with CRUD operations and free routes ([07a2f63](https://github.com/shaishab316/getavails-server/commit/07a2f63af4bfaec331c83c35bdf5474aa44c48fc))
* Implement unread message counts and mark as read ([5b7db65](https://github.com/shaishab316/getavails-server/commit/5b7db65e8a973ee4fe0ba69a84db750bb58e7da7))
* Move uploadMedia route to global scope for general access ([c28a74e](https://github.com/shaishab316/getavails-server/commit/c28a74ec85a2ef2634f06b27b38198c4d1f3c580))

# [1.10.0](https://github.com/shaishab316/getavails-server/compare/v1.9.0...v1.10.0) (2025-11-11)


### Features

* Add GitHub Actions workflow for GitLab mirroring ([b5f03bb](https://github.com/shaishab316/getavails-server/commit/b5f03bb16bd0196934069053e6ffd0a2c4aa7780))
* Include lowercase role in user profile endpoint response ([3d74fb0](https://github.com/shaishab316/getavails-server/commit/3d74fb0dd0c09d8ee86e04437ce632e71d0c4368))
* Integrate dotenvx, update deps, and add .env file ([15e5039](https://github.com/shaishab316/getavails-server/commit/15e5039a2f659f6e094fd4da33c879a14e0a7a2b))
* Standardize error responses with `success: false` ([4979d66](https://github.com/shaishab316/getavails-server/commit/4979d6609c9387c003c185e787ace961baf95fd1))

# [1.10.0](https://github.com/shaishab316/getavails-server/compare/v1.9.0...v1.10.0) (2025-11-09)


### Features

* Integrate dotenvx, update deps, and add .env file ([15e5039](https://github.com/shaishab316/getavails-server/commit/15e5039a2f659f6e094fd4da33c879a14e0a7a2b))
* Standardize error responses with `success: false` ([4979d66](https://github.com/shaishab316/getavails-server/commit/4979d6609c9387c003c185e787ace961baf95fd1))

# [1.9.0](https://github.com/shaishab316/getavails-server/compare/v1.8.0...v1.9.0) (2025-11-08)


### Features

* Add API endpoint for organizer overview ([e2588fd](https://github.com/shaishab316/getavails-server/commit/e2588fde7836f02e55779bc76664fe79aaf57333))
* Add monthly revenue statistics to dashboards & API overviews ([c588d00](https://github.com/shaishab316/getavails-server/commit/c588d00e622d594183ec70e50fbc81ef28637b2b))
* Add overview endpoint for agents and artists ([f029d83](https://github.com/shaishab316/getavails-server/commit/f029d83274cbd247930855f1b186f8e16728b0ce))
* added postman collection ([5f4aa26](https://github.com/shaishab316/getavails-server/commit/5f4aa2634d7056bc35fe71a0cdf67a70cc75a96f))
* Implement "Get Venue Overview" for venue owners ([b68a8e7](https://github.com/shaishab316/getavails-server/commit/b68a8e7885aaaadec3c25c43d273f2e9ae088191))
* Implement admin overview with key statistics ([0b68a25](https://github.com/shaishab316/getavails-server/commit/0b68a25c2627dfd0bf9edb1adcfa501390143f49))

# [1.8.0](https://github.com/shaishab316/getavails-server/compare/v1.7.0...v1.8.0) (2025-11-08)


### Features

* Add event management for organizers with filtering ([fa459c0](https://github.com/shaishab316/getavails-server/commit/fa459c0d1a7dc734d43ba208c62e5906c3d8d25e))
* Add extra parameter to exists validation for complex queries ([57b1a0c](https://github.com/shaishab316/getavails-server/commit/57b1a0ca3649c554014ec38680b196f5d28bed0a))
* Add loading spinner to capture middleware and document User routes ([cb314af](https://github.com/shaishab316/getavails-server/commit/cb314af3910f696c145db36652d5047dca48269a))
* Add organizer active venues retrieval and paginate venue offers ([a6cf878](https://github.com/shaishab316/getavails-server/commit/a6cf878620080bd7a3569a68de5681c80dc6e301))
* Add route for organizers to cancel venue offers & type check ([012cf48](https://github.com/shaishab316/getavails-server/commit/012cf4823615944fc412ba443e9e6e911ff38a66))
* Connect artist to organizer on agent offer payment ([fd298e7](https://github.com/shaishab316/getavails-server/commit/fd298e7532d338b6d227318cf9a8b84898b6ac99))
* Enhance Stripe product description with offer details ([6e0cac8](https://github.com/shaishab316/getavails-server/commit/6e0cac89563a1d94e68b9b4fc21ad9742a2c6f5d))
* Implement agent and artist representation management ([ba75969](https://github.com/shaishab316/getavails-server/commit/ba7596934728e49a00239d376be6edf4448594a1))
* Implement event creation functionality ([f013ee2](https://github.com/shaishab316/getavails-server/commit/f013ee22d0d5c4279b8c1d6e8f16402996fb5412))
* Implement event update functionality ([1bd638a](https://github.com/shaishab316/getavails-server/commit/1bd638a57a3397c5f505150a14a7a30ab50486d5))
* Implement get active artists for organizers ([319fb9b](https://github.com/shaishab316/getavails-server/commit/319fb9b8f1f63a3f47304282c411d6d828b3907a))
* Implement organizer venue offer acceptance and account withdrawal ([5c0244b](https://github.com/shaishab316/getavails-server/commit/5c0244bd637de248d2b947fa858199164d51baf6))
* Implement ticket purchase and update ticket statuses ([afb76f4](https://github.com/shaishab316/getavails-server/commit/afb76f4979ac74a015b62f642b53de4af9e2e59e))
* Implement ticket purchase functionality and event capacity updates ([a977ce7](https://github.com/shaishab316/getavails-server/commit/a977ce7a34b9ec00d292de1a996ebda26d36ccfa))
* Implement user upcoming events retrieval ([f9b4c92](https://github.com/shaishab316/getavails-server/commit/f9b4c92f7b3e8c2a08d92acca82b38f70afa27ab))
* Implement venue offer cancellation functionality ([7343bd2](https://github.com/shaishab316/getavails-server/commit/7343bd26e01fe71b28db922d953b9c406824f59c))
* Implement venue offer functionality for organizers ([f7a3430](https://github.com/shaishab316/getavails-server/commit/f7a343000ea37bd83b020a92d2dd513039dbc937))
* Implement venue offer retrieval ([1a4ddeb](https://github.com/shaishab316/getavails-server/commit/1a4ddeb407c8a2ccd027ed25a32d30e18ba99c79))
* Implement venue_offer service for Stripe Checkout success ([7c0d080](https://github.com/shaishab316/getavails-server/commit/7c0d08064777ebc5163e18da2c7c5377243b077f))
* Improve server lifecycle, ticket cleanup, and logging ([94c38cd](https://github.com/shaishab316/getavails-server/commit/94c38cd4268d80d292334a90fca80eb8c5be0a33))
* Process checkout.session.completed events for payouts ([a34ce90](https://github.com/shaishab316/getavails-server/commit/a34ce90cce502435f26cd4c34794e3e5be4fb47a))
* Refactor agent validation and introduce Event module ([3e94035](https://github.com/shaishab316/getavails-server/commit/3e94035cac720d217f7fb3e3c101aeba90dcfd74))
* Rename event queries and add getAllEvents endpoint ([5f5c0c3](https://github.com/shaishab316/getavails-server/commit/5f5c0c36e78ff5ef913e4e0ee4e43b85f46b3df1))
* Schedule event publishing and add CLI spinner ([ece6c1c](https://github.com/shaishab316/getavails-server/commit/ece6c1cbb41cc498f235d803cf962ad38aaa8b67))
* Use Bull queue for asynchronous file deletion ([6880a8d](https://github.com/shaishab316/getavails-server/commit/6880a8dc0ff22b6761fef02f19e9b761bbde2bdf))

# [1.7.0](https://github.com/shaishab316/getavails-server/compare/v1.6.0...v1.7.0) (2025-11-03)


### Features

* Add agent to offer payload and validate permissions ([6bcb2f7](https://github.com/shaishab316/getavails-server/commit/6bcb2f75b4a62aecf88ff4912281505c1261e144))
* Add Stripe webhook and connect functionality ([75abbb9](https://github.com/shaishab316/getavails-server/commit/75abbb9793ef0e3816cba91cc8d60391eebb2109))
* Implement agent offer acceptance via Stripe checkout ([bd49a91](https://github.com/shaishab316/getavails-server/commit/bd49a91aca06619047bca98b6ed79e682aac0080))
* Implement organizer offer acceptance with Stripe payment ([630bddf](https://github.com/shaishab316/getavails-server/commit/630bddf8cf70b8eb1f97d708a32471aa12287b6f))
* Implement user withdrawal functionality with BullMQ queue ([29668a9](https://github.com/shaishab316/getavails-server/commit/29668a93416dd7aaa9c0dbc1cccc4ce4cb12d0ca))
* Improve seeding scripts with loading spinners, error handling ([ec98901](https://github.com/shaishab316/getavails-server/commit/ec98901bcaa743c32fba9553cd18435297f52af3))
* Integrate Stripe for account connections and webhooks ([411fdea](https://github.com/shaishab316/getavails-server/commit/411fdea0f6990b4481b01e81dd4e7d19ea4223db))
* Introduce payment configuration and Stripe integration ([c741755](https://github.com/shaishab316/getavails-server/commit/c7417559d876bbcf49a13567e68e10ee2c356f54))
* Queue Stripe account creation and improve email handling ([3576b7c](https://github.com/shaishab316/getavails-server/commit/3576b7c2a12ab9052c60c6ea92e778c773475777))

# [1.6.0](https://github.com/shaishab316/getavails-server/compare/v1.5.0...v1.6.0) (2025-11-02)


### Features

* Implement agent offer management and organizer cancellation ([2b5c898](https://github.com/shaishab316/getavails-server/commit/2b5c8983e66f76688be20a08c1c4e17e158d0985))
* Implement AgentOffer module with API endpoint ([7f524de](https://github.com/shaishab316/getavails-server/commit/7f524de178c346f6a01c4612f97b4135b17685a8))
* Implement MJML email templating and update dependencies ([f25a01a](https://github.com/shaishab316/getavails-server/commit/f25a01a9d0ebfff5b321a7498c87d03afaf40a1a))
* Integrate AgentOffer functionality into Agent module ([ff5f2fa](https://github.com/shaishab316/getavails-server/commit/ff5f2fa09dcaf6b226496bdefe072db98abea19d))
* Refactor user data exclusion and fix user registration ([9459921](https://github.com/shaishab316/getavails-server/commit/9459921133d0896f56e751a27e956b0e3438ed9b))

# [1.5.0](https://github.com/shaishab316/getavails-server/compare/v1.4.0...v1.5.0) (2025-11-01)


### Features

* Implement rate limiter for change password endpoint ([efd53dd](https://github.com/shaishab316/getavails-server/commit/efd53ddd8b3b2acb439fb027b9260605e43ddd1c))

# [1.4.0](https://github.com/shaishab316/getavails-server/compare/v1.3.0...v1.4.0) (2025-11-01)


### Features

* Add filtering by unread messages to getInbox API ([a3c96cf](https://github.com/shaishab316/getavails-server/commit/a3c96cf6f14f0203284ebe5f6fe5262cda8c21d9))
* Add filtering by unread messages to getInbox API ([cb4d631](https://github.com/shaishab316/getavails-server/commit/cb4d631ac9b55b91b5960d8be24e76b9c693cb78))
* Define Prisma schema for Chat and Message models ([3f276d2](https://github.com/shaishab316/getavails-server/commit/3f276d2afb927d10c40892e78ad0a5090fbfc556))
* Implement chat module with create/delete functionalities ([2347869](https://github.com/shaishab316/getavails-server/commit/234786980c4ac09e25c30a06ac40db48dbc468f9))
* Implement media upload endpoint with file validation ([5b2f0a9](https://github.com/shaishab316/getavails-server/commit/5b2f0a97c31022f86fa1bcf8118e01e711b33918))
* Implement media upload endpoint with file validation ([1cef4ce](https://github.com/shaishab316/getavails-server/commit/1cef4ce2e7c0e46f233442f53e10b7367793d79f))
* Implement message module with socket integration ([b11b185](https://github.com/shaishab316/getavails-server/commit/b11b18575cb4b41920914922684d912759948cd8))
* Implement message retrieval and validation ([1d2bea1](https://github.com/shaishab316/getavails-server/commit/1d2bea198af4c9c255b8441c9ba25a99e7cc7ab8))
* Implement message retrieval and validation ([f65e526](https://github.com/shaishab316/getavails-server/commit/f65e5267a585ad1fd943d1ac90ea90d6a07b465f))
* Implement user inbox retrieval with pagination and search ([7ac7db7](https://github.com/shaishab316/getavails-server/commit/7ac7db7fce90f27fa3a6590adc72f2c95bc61d7f))
* Refactor chat and message models, add read receipts ([b54d789](https://github.com/shaishab316/getavails-server/commit/b54d7890d1ba30a4ec0b2e5fffd293c8ab27e5b4))
* Refactor chat and message models, add read receipts ([6fcdf31](https://github.com/shaishab316/getavails-server/commit/6fcdf315ed93b27b56f49793620efa80a2f76a1c))

# [1.3.0](https://github.com/shaishab316/getavails-server/compare/v1.2.0...v1.3.0) (2025-10-30)


### Features

* Define Prisma schema for Chat and Message models ([ac88ab7](https://github.com/shaishab316/getavails-server/commit/ac88ab7c03aeb2209f925020d81075452aaffecc))
* Enhance AuthService with OTP, JSDoc, and rate limit changes ([9c35078](https://github.com/shaishab316/getavails-server/commit/9c35078321145e927cfa13c26beebc9ca5f9b43f))
* Implement agent-artist relation deletion and topic metadata optimization ([ffe65fc](https://github.com/shaishab316/getavails-server/commit/ffe65fc465b880fe72440b18746606dd8b0c1f09))
* Implement chat module with create/delete functionalities ([f4a7126](https://github.com/shaishab316/getavails-server/commit/f4a7126f9c4040ecf12bae2a2aaf9e2259ec031b))
* Implement email queuing with Redis and Bull ([5a02498](https://github.com/shaishab316/getavails-server/commit/5a02498a35211e5aee050c21f9b51df9a00fc00e))
* Implement message module with socket integration ([b597628](https://github.com/shaishab316/getavails-server/commit/b597628d848f790d04319220c98e193db60ec865))
* Implement user inbox retrieval with pagination and search ([26fa918](https://github.com/shaishab316/getavails-server/commit/26fa91891c67cebf9e5295c829363fa6b3cc4d13))
* Implement WebSocket handling with Socket.IO ([e9f4547](https://github.com/shaishab316/getavails-server/commit/e9f45473a705e2b14a180aa32842093070a65242))
* Improve user registration and bundle dependencies ([1a8c7ea](https://github.com/shaishab316/getavails-server/commit/1a8c7eadfdb117bfc5845bb40415ecbd2237d9dc))
* Introduce module builder and modernize build process ([8e37f42](https://github.com/shaishab316/getavails-server/commit/8e37f42cac9aa8fe396255e2c149a18c77ad72e4))
* Introduce Venue module and routes, deprecate User venue route ([ae7aa4e](https://github.com/shaishab316/getavails-server/commit/ae7aa4ecdfb636985f0fd9dd9b63b83638a82a38))

# [1.2.0](https://github.com/shaishab316/getavails-server/compare/v1.1.0...v1.2.0) (2025-10-29)


### Features

* Implement agent invitations and artist request processing ([0c2fbca](https://github.com/shaishab316/getavails-server/commit/0c2fbca0044ba8d74507ca2a2034af5d3530d027))
* Implement endpoints for agents/artists to retrieve their lists ([d1d77e1](https://github.com/shaishab316/getavails-server/commit/d1d77e1a461428b1eb3b30da1b2f33c1a145df58))

# [1.1.0](https://github.com/shaishab316/getavails-server/compare/v1.0.0...v1.1.0) (2025-10-28)


### Bug Fixes

* Fix purifyRequest middleware for Express 5 read-only requests ([5444809](https://github.com/shaishab316/getavails-server/commit/54448098935d673ed38af6833b3f32f0b2717904))


### Features

* Add functionality for agents to send requests to artists ([183e944](https://github.com/shaishab316/getavails-server/commit/183e94404f4c87344735087d47baf21f251136f8))
* Enhance auth middleware, refactor user data handling ([64dfd73](https://github.com/shaishab316/getavails-server/commit/64dfd735107b6d3d4bb889512cf527a2e6da28d7))
* Enhance security with rate limiting and update dependencies ([f73de00](https://github.com/shaishab316/getavails-server/commit/f73de006bb26d58f1cbb1bbb79ec43d156491231))
* Enhance security with rate limiting and update dependencies ([2c9767c](https://github.com/shaishab316/getavails-server/commit/2c9767c48d4031967c57c846a228188209ae9d72))
* Implement agent invites and artist approval/rejection ([49310a2](https://github.com/shaishab316/getavails-server/commit/49310a270b1f366ac2ec44653db9ed6f86d7b6d4))
* Implement Agent module and refactor auth route configuration ([1a6d57d](https://github.com/shaishab316/getavails-server/commit/1a6d57da3131e322cbb50611b164123f64351cfc))
* Implement Artist module with retrieval functionalities ([f2b654f](https://github.com/shaishab316/getavails-server/commit/f2b654fb5f3a575983bd63d9239dd63b5de8effb))
* Implement automatic user ID generation ([6f5f6cb](https://github.com/shaishab316/getavails-server/commit/6f5f6cb4037bc5a5458cdcccb2c00c64a76b0b33))
* Introduce Agent module with listing functionality ([c096637](https://github.com/shaishab316/getavails-server/commit/c096637bf140605ec7d4fd2e1ff3d74601379d34))
* Remove Stripe webhook script, add agent-to-artist route ([f12849c](https://github.com/shaishab316/getavails-server/commit/f12849c5610597e61ce4c323fd1a958f3a57967c))

# 1.0.0 (2025-10-27)


### Features

* Allow venue users to update venue information ([bb56d8a](https://github.com/shaishab316/getavails-server/commit/bb56d8ab1369653171735c9faef51989fa966557))
* Enforce required email and default user role on registration ([0a8d03e](https://github.com/shaishab316/getavails-server/commit/0a8d03e8b490f6b8c7d7921701015e09fca14da5))
* Exclude node_modules from esbuild bundle ([cb17fb7](https://github.com/shaishab316/getavails-server/commit/cb17fb79e2a4e2b9900fef38221152857e9920fb))
* Implement account verification via OTP email ([01bfe5b](https://github.com/shaishab316/getavails-server/commit/01bfe5b45ea25cbff1246090b95be62ba4694773))
* Implement agent registration functionality ([9e86d48](https://github.com/shaishab316/getavails-server/commit/9e86d481be37f3f75b7de7f8ec4291d9bf530b2a))
* Implement artist registration functionality ([71f30f6](https://github.com/shaishab316/getavails-server/commit/71f30f626ef453390f43c5c85784268bb80229c2))
* Implement organizer registration functionality ([fa83d8a](https://github.com/shaishab316/getavails-server/commit/fa83d8a272ac975574573a6a97a21d1e343557e3))
* Implement user availability updates via new API endpoint ([e081440](https://github.com/shaishab316/getavails-server/commit/e081440005abc43b6f66381a9a8e512083024eb4)), closes [#11](https://github.com/shaishab316/getavails-server/issues/11)
* Implement Venue module and refactor module builder ([60be295](https://github.com/shaishab316/getavails-server/commit/60be2957de71565b4a3ed882e849f39e586e8618))
* Implement venue registration feature ([d1f5c6d](https://github.com/shaishab316/getavails-server/commit/d1f5c6d044c0f9d7c216731908420cb7d9a48370))
* Integrate database connection and server lifecycle management ([412eb40](https://github.com/shaishab316/getavails-server/commit/412eb40aca140f9dee9c4013cfc1c42c36034627))
* Refactor registration and add venue info endpoint ([46910b1](https://github.com/shaishab316/getavails-server/commit/46910b1b3500ce499a0d18395563c1f0389a8723))
* Refactor registration process to use a single register function ([cfc94e3](https://github.com/shaishab316/getavails-server/commit/cfc94e3a45f164a1107081b1bee372205ca4714c))
* Refactor reset password and update user data handling ([822b29f](https://github.com/shaishab316/getavails-server/commit/822b29fc71bbf38e7ac6496a39f70486db4e9c64))
* Remove OpenAPI/Swagger documentation generation and UI ([3755109](https://github.com/shaishab316/getavails-server/commit/3755109676df848a81cb5c84c30d342d401b12db))
* Remove phone number authentication and user registration ([327fcff](https://github.com/shaishab316/getavails-server/commit/327fcff4e3096c6cdeac2d348806ae1aa371ba73))
* Require email and disable cookie setting for testing ([1f40ba0](https://github.com/shaishab316/getavails-server/commit/1f40ba054118a451fe929e7102af2426f49a69a3))
* Update Docker Compose and Prisma User Omit constants ([a398f70](https://github.com/shaishab316/getavails-server/commit/a398f70c48a195b768cbc7fb4709df99e0654642))
* Update User model and registration with new profile fields ([6be3b90](https://github.com/shaishab316/getavails-server/commit/6be3b905f3931933709e28052114917afe60917c))
* Update User model, remove migrations, and add gitignore rule ([82d8749](https://github.com/shaishab316/getavails-server/commit/82d8749b3716403189912a2865ade8e6a4a6d97c))
* **venue:** allow venues to update their information via API ([22791c0](https://github.com/shaishab316/getavails-server/commit/22791c099f22e34b996f813f5da1215f574b47bc)), closes [#10](https://github.com/shaishab316/getavails-server/issues/10)

# 1.0.0 (2025-10-27)


### Features

* Allow venue users to update venue information ([bb56d8a](https://github.com/Alpha-Bytes-Department/getavails-server/commit/bb56d8ab1369653171735c9faef51989fa966557))
* Enforce required email and default user role on registration ([0a8d03e](https://github.com/Alpha-Bytes-Department/getavails-server/commit/0a8d03e8b490f6b8c7d7921701015e09fca14da5))
* Exclude node_modules from esbuild bundle ([cb17fb7](https://github.com/Alpha-Bytes-Department/getavails-server/commit/cb17fb79e2a4e2b9900fef38221152857e9920fb))
* Implement account verification via OTP email ([01bfe5b](https://github.com/Alpha-Bytes-Department/getavails-server/commit/01bfe5b45ea25cbff1246090b95be62ba4694773))
* Implement agent registration functionality ([9e86d48](https://github.com/Alpha-Bytes-Department/getavails-server/commit/9e86d481be37f3f75b7de7f8ec4291d9bf530b2a))
* Implement artist registration functionality ([71f30f6](https://github.com/Alpha-Bytes-Department/getavails-server/commit/71f30f626ef453390f43c5c85784268bb80229c2))
* Implement organizer registration functionality ([fa83d8a](https://github.com/Alpha-Bytes-Department/getavails-server/commit/fa83d8a272ac975574573a6a97a21d1e343557e3))
* Implement user availability updates via new API endpoint ([e081440](https://github.com/Alpha-Bytes-Department/getavails-server/commit/e081440005abc43b6f66381a9a8e512083024eb4)), closes [#11](https://github.com/Alpha-Bytes-Department/getavails-server/issues/11)
* Implement Venue module and refactor module builder ([60be295](https://github.com/Alpha-Bytes-Department/getavails-server/commit/60be2957de71565b4a3ed882e849f39e586e8618))
* Implement venue registration feature ([d1f5c6d](https://github.com/Alpha-Bytes-Department/getavails-server/commit/d1f5c6d044c0f9d7c216731908420cb7d9a48370))
* Integrate database connection and server lifecycle management ([412eb40](https://github.com/Alpha-Bytes-Department/getavails-server/commit/412eb40aca140f9dee9c4013cfc1c42c36034627))
* Refactor registration and add venue info endpoint ([46910b1](https://github.com/Alpha-Bytes-Department/getavails-server/commit/46910b1b3500ce499a0d18395563c1f0389a8723))
* Refactor registration process to use a single register function ([cfc94e3](https://github.com/Alpha-Bytes-Department/getavails-server/commit/cfc94e3a45f164a1107081b1bee372205ca4714c))
* Refactor reset password and update user data handling ([822b29f](https://github.com/Alpha-Bytes-Department/getavails-server/commit/822b29fc71bbf38e7ac6496a39f70486db4e9c64))
* Remove OpenAPI/Swagger documentation generation and UI ([3755109](https://github.com/Alpha-Bytes-Department/getavails-server/commit/3755109676df848a81cb5c84c30d342d401b12db))
* Remove phone number authentication and user registration ([327fcff](https://github.com/Alpha-Bytes-Department/getavails-server/commit/327fcff4e3096c6cdeac2d348806ae1aa371ba73))
* Require email and disable cookie setting for testing ([1f40ba0](https://github.com/Alpha-Bytes-Department/getavails-server/commit/1f40ba054118a451fe929e7102af2426f49a69a3))
* Update Docker Compose and Prisma User Omit constants ([a398f70](https://github.com/Alpha-Bytes-Department/getavails-server/commit/a398f70c48a195b768cbc7fb4709df99e0654642))
* Update User model and registration with new profile fields ([6be3b90](https://github.com/Alpha-Bytes-Department/getavails-server/commit/6be3b905f3931933709e28052114917afe60917c))
* Update User model, remove migrations, and add gitignore rule ([82d8749](https://github.com/Alpha-Bytes-Department/getavails-server/commit/82d8749b3716403189912a2865ade8e6a4a6d97c))
* **venue:** allow venues to update their information via API ([22791c0](https://github.com/Alpha-Bytes-Department/getavails-server/commit/22791c099f22e34b996f813f5da1215f574b47bc)), closes [#10](https://github.com/Alpha-Bytes-Department/getavails-server/issues/10)
