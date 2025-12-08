<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

// Models
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Transaction;
use App\Models\Review;
use App\Models\Setting;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // 1. CLEAR OLD DATA SAFELY
        Schema::disableForeignKeyConstraints();
        User::truncate();
        Product::truncate();
        Order::truncate();
        OrderItem::truncate();
        Transaction::truncate();
        Review::truncate();
        Setting::truncate();
        Schema::enableForeignKeyConstraints();

        // =================================================================
        // 2. SEED USERS
        // =================================================================
        // Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('admin123'),
            'role' => 'Admin',
            'status' => 'Active',
            'phone' => '0918 123 4567',
            'dob' => '1990-01-01',
            'gender' => 'Other',
        ]);

        // Customers
        $customersData = [
            ['John Doe', 'user@example.com', 'Male'],
            ['Michael Scott', 'michael@dundermifflin.com', 'Male'],
            ['Pam Beesly', 'pam@dundermifflin.com', 'Female'],
            ['Jim Halpert', 'jim@dundermifflin.com', 'Male'],
            ['Dwight Schrute', 'dwight@dundermifflin.com', 'Male'],
        ];

        foreach ($customersData as $data) {
            User::create([
                'name' => $data[0],
                'email' => $data[1],
                'password' => Hash::make('password'),
                'role' => 'Customer',
                'status' => 'Active',
                'phone' => '09' . rand(100000000, 999999999),
                'dob' => Carbon::now()->subYears(rand(20, 45))->format('Y-m-d'),
                'gender' => $data[2],
            ]);
        }

        // =================================================================
        // 3. SEED PRODUCTS (From your list)
        // =================================================================
        
        $productsList = [
            // --- CLOTHING ---
            [
                'image' => 'https://i5.walmartimages.com/asr/d120b7c3-4bf0-4b8d-92b7-ef620253d6a6_1.e8c9da434ad41b1c55c20f59bad3f105.jpeg',
                'name' => 'Plain White Shirt',
                'category' => 'Clothing',
                'sub_category' => 'Top',
                'description' => 'A soft, breathable white cotton shirt designed for all-day comfort. Perfect for layering or everyday casual wear.',
                'price' => 250.00
            ],
            [
                'image' => 'https://img.staticdj.com/ca46b7d2b6923f7c224f2c870c2a1b98_1080x_nw.png',
                'name' => 'Casual Denim Jacket',
                'category' => 'Clothing',
                'sub_category' => 'Outerwear',
                'description' => 'Light blue denim jacket with a relaxed fit, offering a classic style that matches any outfit. Durable and versatile for daily use.',
                'price' => 900.00
            ],
            [
                'image' => 'https://i5.walmartimages.com/asr/fb1f4255-89a9-41fb-b67c-9f6837608f7d_1.4ebe0a758c6099ba0470046a6e4df7f5.jpeg',
                'name' => 'Black Hoodie',
                'category' => 'Clothing',
                'sub_category' => 'Hoodie',
                'description' => 'Cozy fleece-lined hoodie that provides warmth and comfort. Ideal for cool weather and casual looks.',
                'price' => 750.00
            ],
            [
                'image' => 'https://i5.walmartimages.com/seo/Dockers-Men-s-Classic-Flat-Front-Easy-Khaki-Pant-with-Stretch_0dc4f4c3-0b41-4880-a6de-27efe3567a85_1.50312e5aa402fd30c31f1b34f1c67705.jpeg',
                'name' => 'Khaki Pants',
                'category' => 'Clothing',
                'sub_category' => 'Bottom',
                'description' => 'Regular-fit khaki trousers made from breathable fabric, offering a neat and polished everyday appearance.',
                'price' => 650.00
            ],
            [
                'image' => 'https://cdnb.lystit.com/photos/a204-2015/03/16/quiksilver-light-blue-stonewash-mid-rise-jeans-blue-product-3-062969081-normal.jpeg',
                'name' => 'Blue Jeans',
                'category' => 'Clothing',
                'sub_category' => 'Bottom',
                'description' => 'Classic blue straight-cut jeans built for durability and daily comfort. A timeless wardrobe essential.',
                'price' => 780.00
            ],
            [
                'image' => 'https://images.jackjones.com/12249341/4385562/001/jackjones-plaincrewnecksweatshirt-grey.jpg?v=a7f5d15e03bf8120c096d1d0762e564b&format=webp&width=1280&quality=90&key=25-0-3',
                'name' => 'Grey Sweatshirt',
                'category' => 'Clothing',
                'sub_category' => 'Top',
                'description' => 'A warm and lightweight pullover sweatshirt designed for comfort and effortless casual styling.',
                'price' => 550.00
            ],
            [
                'image' => 'https://images.unsplash.com/photo-1633676747161-35969adecb29?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                'name' => 'Red Polo Shirt',
                'category' => 'Clothing',
                'sub_category' => 'Top',
                'description' => 'Sharp-looking red polo shirt made from soft breathable fabric, ideal for semi-casual wear.',
                'price' => 300.00
            ],
            [
                'image' => 'https://stylesweekly.com/wp-content/uploads/2016/06/10-best-floral-dresses-for-beautiful-summer-1.jpg',
                'name' => 'Floral Dress',
                'category' => 'Clothing',
                'sub_category' => 'Dress',
                'description' => 'Light, flowy floral dress perfect for warm days. Soft fabric and a feminine pattern for a fresh, stylish look.',
                'price' => 850.00
            ],
            [
                'image' => 'https://static.vecteezy.com/system/resources/previews/009/257/252/original/black-shorts-mockup-cutout-file-png.png',
                'name' => 'Black Shorts',
                'category' => 'Clothing',
                'sub_category' => 'Bottom',
                'description' => 'Comfortable black cotton shorts made for everyday wear. Simple, lightweight, and easy to pair with any top.',
                'price' => 280.00
            ],
            [
                'image' => 'https://i.pinimg.com/originals/1a/00/6b/1a006bf4e145de7e8571dddc24554232.jpg',
                'name' => 'Beige Cardigan',
                'category' => 'Clothing',
                'sub_category' => 'Outerwear',
                'description' => 'A soft knitted cardigan that adds warmth without the bulk. Neutral beige tone makes it easy to layer with any outfit.',
                'price' => 620.00
            ],

            // --- ACCESSORIES ---
            [
                'image' => 'https://oss.efeglasses.com/goods/E08243/E08243A/E08243A-1.jpg?x-oss-process=image/format,webp',
                'name' => 'Black Sunglasses',
                'category' => 'Accessories',
                'sub_category' => 'Eyewear',
                'description' => 'Stylish black sunglasses with UV protection, perfect for outdoor use and everyday fashion.',
                'price' => 199.00
            ],
            [
                'image' => 'https://cdn.shopify.com/s/files/1/0753/9199/2086/files/wcmedbrown1.jpg',
                'name' => 'Brown Leather Belt',
                'category' => 'Accessories',
                'sub_category' => 'Belt',
                'description' => 'Brown leather belt with a classic buckle design, built to last and complement casual or formal wear.',
                'price' => 180.00
            ],
            [
                'image' => 'https://poedagar.store/wp-content/uploads/2023/10/POEDAGAR-Luxury-Men-Wristwatch-High-Quality-Waterproof-Chronograph-Luminous-Date-Man-Watches-Leather-Men-s-Quartz.jpg',
                'name' => 'Wristwatch',
                'category' => 'Accessories',
                'sub_category' => 'Watch',
                'description' => 'Minimalist analog wristwatch featuring a clean dial and adjustable strap, ideal for daily wear.',
                'price' => 350.00
            ],
            [
                'image' => 'https://i.pinimg.com/originals/8c/ef/c9/8cefc9c9f5d132a345ee7f92e6a46093.jpg',
                'name' => 'Simple Necklace',
                'category' => 'Accessories',
                'sub_category' => 'Jewelry',
                'description' => 'Delicate chain necklace that adds a subtle touch of elegance to any outfit. Perfect for casual or dressy occasions.',
                'price' => 120.00
            ],
            [
                'image' => 'https://i.pinimg.com/originals/a3/b0/2e/a3b02e5884c20b0bd29d8d62d324003b.jpg',
                'name' => 'Silver Earrings',
                'category' => 'Accessories',
                'sub_category' => 'Jewelry',
                'description' => 'Lightweight silver hoop earrings designed for everyday comfort and a timeless minimalist look.',
                'price' => 95.00
            ],
            [
                'image' => 'https://m.media-amazon.com/images/I/71cT3i7B5EL._AC_SL1500_.jpg',
                'name' => 'Black Backpack',
                'category' => 'Accessories',
                'sub_category' => 'Bag',
                'description' => 'A durable black backpack with spacious compartments, ideal for school, travel, or daily use.',
                'price' => 450.00
            ],
            [
                'image' => 'https://male-mode.com/wp-content/uploads/2022/08/wallet-g56ff0d539_1920.jpg',
                'name' => 'Wallet',
                'category' => 'Accessories',
                'sub_category' => 'Wallet',
                'description' => 'A slim and compact wallet that keeps essentials organized while fitting easily in pockets or bags.',
                'price' => 230.00
            ],
            [
                'image' => 'https://www.bhphotovideo.com/images/images2500x2500/beats_by_dr_dre_900_00183_01_studio_wireless_over_ear_headphone_1037578.jpg',
                'name' => 'Headphones',
                'category' => 'Accessories',
                'sub_category' => 'Electronics',
                'description' => 'Reliable wired headphones offering clear audio quality and comfortable ear padding for long listening sessions.',
                'price' => 300.00
            ],
            [
                'image' => 'https://images.playground.com/f9bd4945-aa9f-4be9-afbe-06d7a18d5ae1.jpeg',
                'name' => 'Beige Tote Bag',
                'category' => 'Accessories',
                'sub_category' => 'Bag',
                'description' => 'Simple and eco-friendly canvas tote bag perfect for daily errands, school, or casual outings.',
                'price' => 150.00
            ],
            [
                'image' => 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTAxL2ZyY29tYl9oYWlyX2JlYXV0eV9zemN6b3Rrcy1pbWFnZS1qb2IxNDEwLWxjcmNzcmY3LmpwZw.jpg',
                'name' => 'Hairbrush',
                'category' => 'Accessories',
                'sub_category' => 'Grooming',
                'description' => 'Plastic minimal hairbrush designed to reduce frizz and gently detangle hair with smooth natural bristles.',
                'price' => 80.00
            ],

            // --- SHOES ---
            [
                'image' => 'https://i5.walmartimages.com/seo/Yolanda-Zula-Women-s-Shoes-Slip-Resistant-Flats-Round-Toe-White-US-9-5_08f123ff-ca0e-4202-810f-0a4e70b6af73.789b9d4f846ffe41dc41492e1b796645.jpeg',
                'name' => 'White Sneakers',
                'category' => 'Shoes',
                'sub_category' => 'Casual',
                'description' => 'Clean and lightweight white sneakers that match any outfit. Built for comfort and everyday walking.',
                'price' => 900.00
            ],
            [
                'image' => 'https://5.imimg.com/data5/SELLER/Default/2024/2/389680011/JF/SR/PT/155922666/running-shoes.jpg',
                'name' => 'Running Shoes',
                'category' => 'Shoes',
                'sub_category' => 'Sports',
                'description' => 'Breathable mesh running shoes with cushioned soles designed for support during active use.',
                'price' => 1200.00
            ],
            [
                'image' => 'https://cdn.mos.cms.futurecdn.net/whowhatwear/posts/269008/best-brown-boots-269008-1538406052337-main-1600-80.jpg',
                'name' => 'Brown Boots',
                'category' => 'Shoes',
                'sub_category' => 'Boots',
                'description' => 'Durable brown boots made from tough material, perfect for casual wear or outdoor use.',
                'price' => 1450.00
            ],
            [
                'image' => 'https://www.muloshoes.com/wp-content/uploads/Blue-Mens-Slip-On-Sneakers-in-Navy-Suede.jpg',
                'name' => 'Slip-on Shoes',
                'category' => 'Shoes',
                'sub_category' => 'Casual',
                'description' => 'Easy-to-wear slip-on shoes with flexible soles for all-day comfort and convenient style.',
                'price' => 650.00
            ],
            [
                'image' => 'https://down-ph.img.susercontent.com/file/f0d29b4d962317914138fc57c0a7da6d',
                'name' => 'Black Formal Shoes',
                'category' => 'Shoes',
                'sub_category' => 'Formal',
                'description' => 'Sleek black dress shoes with a polished finish, ideal for formal events or office wear.',
                'price' => 820.00
            ],
            [
                'image' => 'https://i.pinimg.com/originals/af/f0/db/aff0db51ed5f7de6d7f11958e149bcac.jpg',
                'name' => 'Sandals',
                'category' => 'Shoes',
                'sub_category' => 'Casual',
                'description' => 'Lightweight open-toe sandals designed for breathability and relaxed everyday use.',
                'price' => 250.00
            ],
            [
                'image' => 'https://media-photos.depop.com/b1/13286429/1407146726_b98843281cdb430f8596df96c0309bbb/P0.jpg',
                'name' => 'Grey Trainers',
                'category' => 'Shoes',
                'sub_category' => 'Sports',
                'description' => 'Soft-foam grey trainers offering good grip and comfort for workouts or daily activities.',
                'price' => 1050.00
            ],
            [
                'image' => 'https://cdn11.bigcommerce.com/s-21x65e8kfn/images/stencil/original/products/52093/248460/NIK21749_1000_1__23272.1688589455.jpg',
                'name' => 'Running Cleats',
                'category' => 'Shoes',
                'sub_category' => 'Sports',
                'description' => 'Field-ready running cleats engineered for stability and traction during sports activities.',
                'price' => 1500.00
            ],
            [
                'image' => 'https://thefashionglobe.com/wp-content/uploads/2025/02/brown-loafers.jpeg',
                'name' => 'Brown Loafers',
                'category' => 'Shoes',
                'sub_category' => 'Formal',
                'description' => 'Classic brown loafers with a comfortable slip-on design suitable for smart-casual or office wear.',
                'price' => 780.00
            ],
            [
                'image' => 'https://wallpapers.com/images/hd/sleek-black-flip-flop-png-yxs-j1bf4645x0z663jd.png',
                'name' => 'Black Flip-flops',
                'category' => 'Shoes',
                'sub_category' => 'Casual',
                'description' => 'Soft and lightweight flip-flops ideal for indoor and outdoor casual use.',
                'price' => 80.00
            ],
        ];

        // Insert and assign random stock + rating
        foreach ($productsList as $p) {
            Product::create([
                'name' => $p['name'],
                'price' => $p['price'],
                'category' => $p['category'],
                'sub_category' => $p['sub_category'],
                'description' => $p['description'],
                'image' => $p['image'],
                'stock' => rand(15, 100), // Random stock between 15 and 100
                'cached_avg_rating' => 0, // Default to 0, reviews will update this
                'created_at' => Carbon::now()->subDays(rand(1, 60)),
            ]);
        }

        // =================================================================
        // 4. SEED SETTINGS
        // =================================================================
        Setting::create([
            'key' => 'store_info',
            'value' => [
                'name' => 'HappyCart',
                'currency' => 'PHP',
                'shippingFee' => 150,
                'email' => 'support@happycart.com',
                'freeShippingThreshold' => 5000,
                'taxRate' => 12
            ]
        ]);

        Setting::create([
            'key' => 'system_toggles',
            'value' => ['maintenanceMode' => false, 'allowRegistration' => true, 'enableReviews' => true]
        ]);

        Setting::create([
            'key' => 'categories',
            'value' => ['Clothing', 'Shoes', 'Accessories']
        ]);
    }
}