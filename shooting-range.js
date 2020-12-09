import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from './examples/obj-file-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture, Graphics_Card_Object, Webgl_Manager
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs


//code from assignment 2 for drawing cubes

/*      class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
    }
}*/

class Line extends Shape {
    constructor() {
        super("position", "color");
        this.arrays.position = Vector3.cast(
            [0,0,-1], [0,0,1]);
        this.arrays.color = Array(2).fill(0).map(x => hex_color("#fc0404"));
        this.indices = false;
    }
}

export class Text_Line extends Shape {                           // **Text_Line** embeds text in the 3D world, using a crude texture
                                                                 // method.  This Shape is made of a horizontal arrangement of quads.
                                                                 // Each is textured over with images of ASCII characters, spelling
                                                                 // out a string.  Usage:  Instantiate the Shape with the desired
                                                                 // character line width.  Then assign it a single-line string by calling
                                                                 // set_string("your string") on it. Draw the shape on a material
                                                                 // with full ambient weight, and text.png assigned as its texture
                                                                 // file.  For multi-line strings, repeat this process and draw with
                                                                 // a different matrix.
    constructor(max_size) {
        super("position", "normal", "texture_coord");
        this.max_size = max_size;
        var object_transform = Mat4.identity();
        for (var i = 0; i < max_size; i++) {                                       // Each quad is a separate Square instance:
            defs.Square.insert_transformed_copy_into(this, [], object_transform);
            object_transform.post_multiply(Mat4.translation(1.5, 0, 0));
        }
    }

    set_string(line, context) {           // set_string():  Call this to overwrite the texture coordinates buffer with new
        // values per quad, which enclose each of the string's characters.
        this.arrays.texture_coord = [];
        for (var i = 0; i < this.max_size; i++) {
            var row = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) / 16),
                col = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) % 16);

            var skip = 3, size = 32, sizefloor = size - skip;
            var dim = size * 16,
                left = (col * size + skip) / dim, top = (row * size + skip) / dim,
                right = (col * size + sizefloor) / dim, bottom = (row * size + sizefloor + 5) / dim;

            this.arrays.texture_coord.push(...Vector.cast([left, 1 - bottom], [right, 1 - bottom],
                [left, 1 - top], [right, 1 - top]));
        }
        if (!this.existing) {
            this.copy_onto_graphics_card(context);
            this.existing = true;
        } else
            this.copy_onto_graphics_card(context, ["texture_coord"], false);
    }
}

/////////////TARGET CLASS MUST READ COMMENTS TO UNDERSTAND!!!!!!!!!! -AT
/////////////////////////////////////////////////////////////////////////////////------------------------------------------
class Target extends defs.Subdivision_Sphere{
    static SCORE = 0;
    static SCALE_FACTOR = 1.0;
    static IS_GAME_OVER = false;
    static FINAL_TIME = 0.0;
    constructor(level){ //pass in level in constructor, RECOMMEND USE 1-3, for 3 different levels
                             //pass in a unique key for each target as well; this is automatically generated 
        super(3-level); //lvl = 1 => subdivs of 2, lvl = 2 => subdivs of 1, lvl = 3 or greater => subdivs of 0
        this.level = level; //in case you need the level of the object, might be useful into adding time when an Target is shot
        this.isShot = false; //in case you need to check whether a target has been shot, might be useful in adding time to timer when a target is shot
        
        this.x_location = Math.floor(Math.random()*36) - 18 // generates a random initial location along x axis for the target
        this.move_right = Math.random() < 0.5; // generate a random boolean to determine direction of motion
        this.timeShot = 0.0; // records when the target was shot
    }

    draw(webgl_manager, program_state, model_transform, material, type = "TRIANGLES"){//need to override draw() function from parent
        //if(!this.isShot){ //if not shot, draw , else nothing happens => the target disappears from canvas since it's not being drawn.
            super.draw(webgl_manager, program_state, model_transform, material, type = "TRIANGLES");
        //}
    }

    shoot() //when this function is called, the object is considered to be shot, once it's shot, it also adds to the SCORE
    {
            this.isShot = true;//set status of shot to true
            this.timeShot = this.t; // record when target was shot
            if(!Target.IS_GAME_OVER)
                Target.SCORE += this.level / 2; //add to static member SCORE based on level, lvl 1 adds 1, lvl 2 adds 2, and so on
    }

    // render draws each target object twice: once to the offscreen framebuffer, once to the onscreen framebuffer
    render(webgl_manager, program_state, model_transform, material1, material2, type = "TRIANGLES", framebuffer){
        const gl = webgl_manager.context;

        //material 1 is offscreen (white for trial)
        //material 2 is onscreen (black)

        //bind framebuffer to read offscreen framebuffer
         gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
           
        //draw offscreen
            this.draw(webgl_manager, program_state, model_transform, material1, type = "TRIANGLES");  
              

        //onscreen rendering: draw to default onscreen buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        
        //draw onscreen
            this.draw(webgl_manager, program_state, model_transform, material2, type = "TRIANGLES");
           
            
     }

    check_if_shot(readout, key){
         
         //compare
         if(this.compare(readout, key)){
                this.shoot();
         }

         return true;

    }
    //get readout; will be in vals 0-256
    get_readout(webgl_manager, framebuffer, x, y){
        const gl = webgl_manager.context;

        var readout = new Uint8Array(1*1*4);

         //bind framebuffer to read offscreen framebuffer

         gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

         //read the pixel
         gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, readout);

         //bind back to onscreen framebuffer
         gl.bindFramebuffer(gl.FRAMEBUFFER, null);

         return readout;

    }

    //comparison: if difference is less than 1, we have a hit
    compare(readout, key){
        console.log('key', Math.round(key[0]*255), Math.round(key[1]*255), Math.round(key[2]*255));
        return (Math.abs(Math.round(key[0]*255) - readout[0]) <= 1 &&
            Math.abs(Math.round(key[1]*255) - readout[1]) <= 1 &&
            Math.abs(Math.round(key[2]*255) - readout[2]) <= 1);
    }

    
};
////////////////////////////////////////////////////////////////////////////////////////////////////-----------------------------------------------------------

export class ShootingRange extends Scene {
    constructor(context) {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();   

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            range: new Cube,
            cube: new defs.Cube(),
            text: new Text_Line(35),
            muzzle: new Cube,
            gun: new Shape_From_File("assets/m4a1.obj"),

            ray: new Line,
            cylinder: new defs.Cylindrical_Tube(4,16)
        };
        const texture = new defs.Textured_Phong(1);

        this.shapes.cylinder.arrays.texture_coord.map(function(x){return x.scale_by(0.5);});
        this.shapes.range.arrays.texture_coord.map(function(x){return x.scale_by(2);});

///////////OFFSCREEN FRAMEBUFFER/////////////////////////////////////////////////////////////////////////////////////
        //make offscreen texture and framebuffer:
        //this.offscreen_buffer = new Offscreen_Framebuffer();
        //this.offscreen_buffer.make_buffer(context)
        

//////////////TARGET LIST ARRAY, we can use array to push targets when we want to create new one and pop them out when they are no longer in use e.g. shot
//         this.target_key_list = [
            
//         ]
        
        this.keys = [];

        this.target_list = [
            new (Target.prototype.make_flat_shaded_version())(1), //<= args is the level of the target
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
            new (Target.prototype.make_flat_shaded_version())(1),
        ];

        //generate unique keys
        for (let i = 0; i < this.target_list.length; i++)
        {
            //make key
            var random_key = this.key_generator();

            //if the key is not unique, keep generating new keys until it is unique
            while(!this.is_unique(random_key)){
                random_key = this.key_generator;
            }

            //if key is unique, push it onto the list
            this.keys.push(random_key);
        }

        //output key values for debugging 
        var id = [];
        for (let j = 0; j < this.keys.length; j++){
            let val = vec3(Math.abs(Math.round(this.keys[j][0]*255)), Math.abs(Math.round(this.keys[j][1]*255)), Math.abs(Math.round(this.keys[j][2]*255)));
            id.push(val);
        }
        console.log(id);
        console.log(this.keys)

        //this.target_list.push(new (Target.prototype.make_flat_shaded_version())(3)); =>can push in new target using this...
                //...method in display func but make sure that it is only called on using an if statement

//////////////////////////////////////////////////////////////////////////////////////////////////////////

        // *** Materials
        this.materials = {
            range1: new Material(new defs.Phong_Shader(),
                {ambient: .5, diffusivity: .6, specularity: 1, color: color(0,0,0,1)}),
            range2: new Material(new defs.Phong_Shader(),
                {ambient: .7, diffusivity: .6, color: color(1, 0, 0, 1)}),
            target: new Material(new defs.Phong_Shader(),
                {ambient: 0, diffusivity: .6, specularity: 1.0, color: color(0, 0, 0, 1)}),

            text_image: new Material(texture, {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")}),
            gun_material: new Material(new defs.Phong_Shader,
                {color: hex_color("#000000"), ambient: .6, diffusivity: .5, specularity: 1}),
            cube: new Material(new defs.Phong_Shader(),
                {ambient: .5, diffusivity: 0, specularity: 0,color: color(0, 0, 0, 1)}),
            ray: new Material(new defs.Basic_Shader()),
            cylinder: new Material(new defs.Phong_Shader(),
                {ambient: .5, diffusivity: 0, specularity: 0, color: color(0, 0, 0, 1)}),
            texture3: new Material(new Texture_Scroll_Y(), {
                color: color(1,0,0,1),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/pattern2.png","LINEAR_MIPMAP_LINEAR")
            }),
            texture4: new Material(new Texture_Scroll_Y_OPP(), {
                color: color(1,0,0,1),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/pattern2.png","LINEAR_MIPMAP_LINEAR")
            }),
            muzzleFlash: new Material(new Textured_Phong(), {
                color: color(0,0,0,1),
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/flash.png","LINEAR_MIPMAP_LINEAR")
            }),

            offscreen_target: new Material(new key_color(),
               {ambient: 1, diffusivity: 0, specularity: 0, color: color(1, 1, 1, 1)}),
               
        }
        
        //set camera location:
            // first vector is camera location
            // second vector is what we are looking at
            // set y value at 8 so we are looking at the far wall 
        //look_at() gives you eye transformation matrix (world space --> eye space)
        let camera_position = vec3(0, 10, 50);
        this.initial_camera_location = Mat4.look_at(camera_position, vec3(0, 8, 0), vec3(0, 1, 0));

    }
0
    make_control_panel() {
        // addEventListener('mousedown', this.mouse_picking); //this works so mouse_picking is called when you click the left mouse button
    }

    //generates a random color
    key_generator(){
            let key = color(Math.random(), Math.random(), Math.random(), 1);
            return key;
    }

    //go through all existing keys and return false if the given key is already present
    //colors are given in decimal values, so convert them to a 0-256 scale, which gl.readPixels uses
    //colors need to be unique in the 0-256 scale so picking will work on different colors 
    is_unique(key){
        for (let i = 0; i < this.keys.length; i++)
        {
            if ((Math.abs(Math.round(key[0]*255)) == Math.abs(Math.round(this.keys[0]*255))) && 
            (Math.abs(Math.round(key[1]*255)) == Math.abs(Math.round(this.keys[1]*255))) &&
            (Math.abs(Math.round(key[2]*255)) == Math.abs(Math.round(this.keys[2]*255)))){
                return false;
            }
        }
        return true;
    }

   // only called if you click the left mouse button
    mouse_picking(context, program_state, model_transform, framebuffer){
        
        this.CLICK = false;

        // same code as below for mouse movement
        console.log(defs.canvas_mouse_pos);

        let mouse_x = 0;
        let mouse_y = 0;

        if(defs.canvas_mouse_pos) {
            mouse_x = defs.canvas_mouse_pos.dot(vec(1, 0));
            mouse_y = defs.canvas_mouse_pos.dot(vec(0, 1));
        }

         mouse_x = mouse_x + 540;
         mouse_y = (-mouse_y) + 300;

        
        let x = ((2.0 * mouse_x) / 1080.0) - 1.0;
        let y = 1.0 - ((2.0 * mouse_y) / 600.0);
        let mouse_view = vec4(x, y, -1, 1);

        console.log('mouse', mouse_view);
       
        
        let readout = this.target_list[0].get_readout(context, framebuffer, mouse_x, mouse_y);
        console.log('readout', readout);
        //check if pixel under mouse is part of target
        for (let i=0; i < this.target_list.length; i++)
        {
            this.target_list[i].check_if_shot(readout, this.keys[i]);
        }

    }

   


    

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

        //context in display() is a webgl_manager 

        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        const periodic = Math.cos(Math.PI*t/5);
        const periodic_2 = Math.cos(Math.PI*t)**5;

        this.color_changer = [
            color(0.5-(0.5*periodic),0,0.5+(0.5*periodic),1),
            color(0.5+(0.5*periodic),0,0.5-(0.5*periodic),1),
            color(0.5-(0.5*periodic),0.5+(0.5*periodic),0.5-(0.5*periodic),1),
        ];


        const light_position = vec4(0, 30, 60, 1);
        program_state.lights = [new Light(light_position, this.color_changer[0], 1000)];

        let model_transform = Mat4.identity();

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);
        
        
        const framebuffer = context.get_framebuffer();
        const gl = context.context;

        //clear the offscreen framebuffer each frame before drawing
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

       
        let score = 0;

//DRAW RANGE FLOORS AND WALL ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        let floor_transform = model_transform.times(Mat4.scale(30, 0.3, 30));
        let wall_transform = model_transform.times(Mat4.translation(0, 10, -10, 1)).times(Mat4.scale(25, 30, 0.3));


            this.shapes.range.draw(context, program_state, floor_transform, this.materials.range2.override({color: this.color_changer[0]}));

            this.shapes.range.draw(context, program_state, wall_transform, this.materials.range2.override({color: this.color_changer[0]}));


        let wall_transform_2 = model_transform.times(Mat4.translation(20, 10, -10)).times(Mat4.scale(0.3, 30, 50));

            this.shapes.range.draw(context, program_state, wall_transform_2, this.materials.texture4.override({color: this.color_changer[0]}));

        wall_transform_2 = wall_transform_2.times(Mat4.scale(10/3, 1/30, 1/50)).times(Mat4.translation(-40,0,0))
                                            .times(Mat4.scale(0.3, 30, 50));

            this.shapes.range.draw(context, program_state, wall_transform_2, this.materials.texture3.override({color: this.color_changer[0]}));
//DRAW OTHER PROPS ON SCENE/////////////////////////////////////////////////////////////////////////////
        let cube_trans = model_transform.times(Mat4.scale(2,2,2))
                                .times(Mat4.translation(9,0,12));

            this.shapes.cube.draw(context, program_state, cube_trans, this.materials.cube);

        cube_trans = cube_trans.times(Mat4.translation(-18,0,0));

            this.shapes.cube.draw(context, program_state, cube_trans, this.materials.cube);

        let cyl_trans = model_transform.times(Mat4.rotation(Math.PI/2,1,0,0))
            .times(Mat4.translation(18,24,-10))
            .times(Mat4.scale(1,1,20));


            this.shapes.cylinder.draw(context, program_state, cyl_trans, this.materials.cylinder);

        cyl_trans = cyl_trans.times(Mat4.translation(-36,0,0));

            this.shapes.cylinder.draw(context, program_state, cyl_trans, this.materials.cylinder);


//DISPLAY TIME/////////////////////////////////////////////////////////////////////////////////////////////////////
        let time = 30 - t + Target.SCORE;
        Target.IS_GAME_OVER = time < 0;
        if (Target.IS_GAME_OVER){
            let line = "Final score: " + Target.FINAL_TIME.toString();
            this.shapes.text.set_string(line, context.context);
        }
        else{
            time = time.toPrecision(4);
            let line = "Time: " + time.toString(); 
            this.shapes.text.set_string(line, context.context);
            Target.FINAL_TIME = t;
        }
        this.shapes.text.draw(context, program_state, model_transform.times(Mat4.translation(-8, 26, 0)), this.materials.text_image);
        
//DRAW TARGETS///////////////////////////////////////////////////////////////////////////////////////////////////////////
        
//         const hover = 0.1*Math.sin(2*t);
//         let target1 = model_transform.times(Mat4.translation(-15, 9 + hover, -9));
//         let target2 = model_transform.times(Mat4.translation(0, 9 + hover, -9));
//         let target3 = model_transform.times(Mat4.translation(15, 9 + hover, -9));

        //var position = [target1, target2, target3];
        //var positions = [target1, target2];

        //first material is offscreen, second material is onscreen
       
        //this.offscreen_buffer.render(this.target_list, positions, context, program_state, this.materials.offscreen_target, this.materials.target,
        //"TRIANGLES")
       // for(let i = 0; i < this.target_list.length; i++){
//             this.target_list[i].render(context, program_state, positions[i], this.materials.offscreen_target.override({color: this.keys[i]}), this.materials.target, "TRIANGLES",
//              framebuffer, renderbuffer, texture);
       //}
        
        const hover = 0.1*Math.sin(2*t);
        var index = 0;
        for(var j = 0; j < 3; j++){ // number of z planes consisting of targets
            for(var i = 0; i < 9; i++){ // number of targets along the y axis on a given z plane
                if (!Target.IS_GAME_OVER){
                    // draw all targets in target_list that aren't shot:
                if(!this.target_list[index].isShot){ 
                    // test if we are in level 2. if so, move target and slowly decrease its size until a certain point:
                    if(t > 10){ // adjust right side to control when game transitions from level 1 to level 2
                        if(this.target_list[index].x_location > 18 || this.target_list[index].x_location < -18)
                            this.target_list[index].move_right ^= true; // change direction of motion if needed
                        
                        if(this.target_list[index].move_right){
                            this.target_list[index].x_location += 0.1; // adjust right side to control how fast objects move
                        }
                        else{
                            this.target_list[index].x_location -= 0.1; // same as above
                        }

                        if(Target.SCALE_FACTOR > 0.5){ // adjust right side to control minimum size of targets
                            Target.SCALE_FACTOR -= 0.00001; // adjust right side to control how fast targets get smaller as time goes on
                        }
                            
                    }
                    let target_transform = model_transform.times(Mat4.translation(this.target_list[index].x_location, 2 + i * 3 + hover, -9 + j * 6))
                        .times(Mat4.scale(Target.SCALE_FACTOR, Target.SCALE_FACTOR, Target.SCALE_FACTOR));

                    //draw the target in onscreen framebuffer and offscreen framebuffer
                    //this.target_list[index].render(context, program_state, target_transform, this.materials.offscreen_target.override({color: this.keys[index]}), this.materials.target, "TRIANGLES",framebuffer);
                    
                    //draw offscreen
                    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                    this.target_list[index].draw(context, program_state, target_transform, this.materials.offscreen_target.override({color: this.keys[index]}));

                    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    this.target_list[index].draw(context, program_state, target_transform, this.materials.target);
                    this.target_list[index].t = program_state.animation_time;
                }

                // if target was recently shot, increase target in size for a short time before making it disappear:
                else if(program_state.animation_time - this.target_list[index].timeShot < 1000){ // adjust right side to control how long target increases in size before disappearing
                    let delta_t = (program_state.animation_time - this.target_list[index].timeShot) / 2000; // adjust denominator to control the rate at which target increases in size before disappearing
                    let target_transform = model_transform.times(Mat4.translation(this.target_list[index].x_location, 2 + i * 3 + hover, -9 + j * 6))
                        .times(Mat4.scale(Target.SCALE_FACTOR + delta_t, Target.SCALE_FACTOR + delta_t, Target.SCALE_FACTOR + delta_t));
                    this.target_list[index].draw(context, program_state, target_transform, this.materials.target.override({ambient: .3, color: this.color_changer[1]}));
                }

                // make a new target in place of old target after a short while:
                else if(program_state.animation_time - this.target_list[index].timeShot > 2000){
                    this.target_list.splice(index, 1, new (Target.prototype.make_flat_shaded_version())(t > 10 ? 2 : 1)); // if 10 seconds has passed, make level 2 targets instead of level 1
                }
                index++;
                }
                
            }
        }
        
        
      
        
       

//DRAW IDLE TARGETS







//DRAW THE GUN//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        let model_transform_gun = model_transform.times(Mat4.translation(0, 8.8, 47.5)).times(Mat4.rotation(Math.PI, 0, 1, 0)).times(Mat4.rotation(0.04, 1, 0, 0));



    //GET MOUSE POSITION FROM CANVAS////////////////////////

         let mouse_x = 0;
         let mouse_y = 0;

         if(defs.canvas_mouse_pos) {
             mouse_x = defs.canvas_mouse_pos.dot(vec(1, 0));
             mouse_y = defs.canvas_mouse_pos.dot(vec(0, 1));
         }

        //console.log(this.target_list); //We can call the SCORE using static member of Target Class


        model_transform_gun = model_transform_gun.times(Mat4.translation(3*mouse_x/540,0,0))

        model_transform_gun = model_transform_gun.times(Mat4.rotation(1.53*Math.atan(-mouse_x/1000), 0,1,0));


        model_transform_gun = model_transform_gun.times(Mat4.rotation(1.59*Math.atan((mouse_y-8.8)/1000), 1,0,0));



        this.shapes.gun.draw(context, program_state, model_transform_gun,this.materials.gun_material);




        //model_transform_gun = model_transform_gun.times(Mat4.translation(0, 0, 40)).times(Mat4.scale(1,1,150));

        //this.shapes.ray.draw(context, program_state, model_transform_gun, this.materials.ray, "LINES");


       
        var canvas = document.getElementById('main-canvas');

        //get context back if it gets lost
        canvas.addEventListener('webglcontextlost', function(event) {
            console.log('context lost')
            event.preventDefault();
        }, false);

        //re-setup WebGL state and re-create resources when context restored
        //canvas.addEventListener('webglcontextrestored', this.offscreen_buffer.make_buffer(context), false);


        //check for clicks
        canvas.addEventListener('click', () => {
            this.CLICK = true;
        });

        if (this.CLICK){
            let shoot = new Audio("assets/shoot.wav");
            shoot.play();
            console.log(shoot);
            model_transform_gun = model_transform_gun.times(Mat4.translation(0,0,3)).times(Mat4.scale(0.25,0.25,0))
            this.shapes.muzzle.draw(context,program_state, model_transform_gun,this.materials.muzzleFlash);
            this.mouse_picking(context, program_state, model_transform, framebuffer);
        }





    }
}

////////////////OFFSCREEN NEW TEXTURE AND FRAMEBUFFER///////////////////////////////////////////////////////////
class Offscreen_Framebuffer extends Graphics_Card_Object {
    constructor(){
        super();
        this.framebuffer = null;
        this.texture = null;
        this.renderbuffer = null;

//         for (let name of ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"]) {
//                 this.context = this.canvas.getContext(name);
//                 if (this.context) break;
//             }
//             if (!this.context) throw "Canvas failed to make a WebGL context.";
//             const gl = this.context;

    }

//     make_buffer(webgl_manager) {
//         //make offscreen texture to store colors 
//             //only want to store colors of the scene, so texture size is size of canvas 
//             //don't actually use this texture to draw anything; the colors (unique id's) are drawn here 
//         const gl = webgl_manager.context;
        
//         var width = 1080;
//         var height = 600;

//             //make texture
//         this.texture = gl.createTexture();
//             //bind texture, but do not bind an image to the texture 
//         gl.bindTexture(gl.TEXTURE_2D, this.texture);
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    

    
//         //make renderbuffer (z-buffer) and attach it to framebuffer
//             //size is same as texture
//             //for every pixel in framebuffer, store depth and color
//         this.renderbuffer = gl.createRenderbuffer();
//         gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
//         gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        
//         //make offscreen framebuffer: attach texture and renderbuffer to this framebuffer
//         this.framebuffer = gl.createFramebuffer();
//             //make this framebuffer this current framebuffer
//         gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
//             //bind texture to framebuffer
//         gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
//             //bind renderbuffer to framebuffer
//         gl.enable(gl.DEPTH_TEST);
//         gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);

//         //gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
 
//         //troubleshooting
// //          if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
// //             const error = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
// //             console.log('this combination of attachments does not work');
// //             console.log(error);
// //             return;
// //          }
    
//         //cleanup: unbind this offscreen framebuffer so we go back to onscreen framebuffer 
//         gl.bindTexture(gl.TEXTURE_2D, null);
//         gl.bindRenderbuffer(gl.RENDERBUFFER, null);
//         gl.bindFramebuffer(gl.FRAMEBUFFER, null);  


//     }

    return_framebuffer() {
        return this.framebuffer;
    }

    return_renderbuffer() {
        return this.renderbuffer;
    }

    return_texture(){
        return this.texture;
    }

    clear(webgl_manager) {
        const gl = webgl_manager.context;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    }

}


    

      //each target will have an (unseen) unique 'diffuse color', i.e. their unique identifier
      //put unique colors in offscreen framebuffer 
class key_color extends Shader {
    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );
                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );

//                 if (uOffscreen){
//                     gl_FragColor = uMaterialDiffuse;
//                     return;
//                 }
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}
     



////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////WALL TEXTURES/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Texture_Scroll_Y extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                
                vec2 current_coord = f_tex_coord + vec2(0,0.25*animation_time);
                

                //if(mod(animation_time, 2.0) == 1.0)//reset every second
                    //current_coord.x = mod(current_coord.x, animation_time); 
                
                            
                vec4 tex_color = texture2D( texture , current_coord) ;
                
                if( tex_color.w < .01 ) discard;
                
                if (tex_color.x == tex_color.y && tex_color.y == tex_color.z && 
                    tex_color.x < 0.25 && tex_color.y < 0.25 && tex_color.z < 0.25)                                                         // Compute an initial (ambient) color:
                    gl_FragColor = vec4( (tex_color.xyz)  * ambient, shape_color.w * tex_color.w );
                else
                    gl_FragColor = vec4( (shape_color.xyz)  * ambient, shape_color.w);  
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

class Texture_Scroll_Y_OPP extends Textured_Phong {
    // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
    fragment_glsl_code() {
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                
                vec2 current_coord = f_tex_coord + vec2(0,-0.25*animation_time);
                

                //if(mod(animation_time, 2.0) == 1.0)//reset every second
                    //current_coord.x = mod(current_coord.x, animation_time); 
                
                            
                vec4 tex_color = texture2D( texture , current_coord) ;
                
                if( tex_color.w < .01 ) discard;
                
                if (tex_color.x == tex_color.y && tex_color.y == tex_color.z && 
                    tex_color.x < 0.25 && tex_color.y < 0.25 && tex_color.z < 0.25)                                                         // Compute an initial (ambient) color:
                    gl_FragColor = vec4( (tex_color.xyz)  * ambient, shape_color.w * tex_color.w );
                else
                    gl_FragColor = vec4( (shape_color.xyz)  * ambient, shape_color.w);  
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `;
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

