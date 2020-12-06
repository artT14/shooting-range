import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from './examples/obj-file-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
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
    constructor(level){ //pass in level in constructor, RECOMMEND USE 1-3, for 3 different levels
        super(3-level); //lvl = 1 => subdivs of 2, lvl = 2 => subdivs of 1, lvl = 3 or greater => subdivs of 0
        this.level = level; //in case you need the level of the object, might be useful into adding time when an Target is shot
        this.isShot = false; //in case you need to check whether a target has been shot, might be useful in adding time to timer when a target is shot
        this.x_location = Math.floor(Math.random()*36) - 18 // generates a random initial location along x axis for the target
        this.move_right = Math.random() < 0.5; // generate a random boolean to determine direction of motion
        this.timeShot = 0.0; // records when the target was shot
    }

    draw(webgl_manager, program_state, model_transform, material, type = "TRIANGLES"){//need to override draw() function from parent
        super.draw(webgl_manager, program_state, model_transform, material, type = "TRIANGLES");    

    }

    shoot() //when this function is called, the object is considered to be shot, once it's shot, it also adds to the SCORE
    {
            this.isShot = true;//set status of shot to true
            Target.SCORE += this.level; //add to static member SCORE based on level, lvl 1 adds 1, lvl 2 adds 2, and so on
            this.timeShot = this.t; // record when target was shot
    }

    
};
////////////////////////////////////////////////////////////////////////////////////////////////////-----------------------------------------------------------

export class ShootingRange extends Scene {
    constructor() {
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

//////////////TARGET LIST ARRAY, we can use array to push targets when we want to create new one and pop them out when they are no longer in use e.g. shot
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

   // only called if you click the left mouse button
    mouse_picking(context, program_state, model_transform){
        
        this.CLICK = false;

        // same code as below for mouse movement
        console.log(defs.canvas_mouse_pos);

        let mouse_x = 0;
        let mouse_y = 0;

        if(defs.canvas_mouse_pos) {
            mouse_x = defs.canvas_mouse_pos.dot(vec(1, 0));
            mouse_y = defs.canvas_mouse_pos.dot(vec(0, 1));
        }

//         mouse_x = mouse_x + 540;
//         mouse_y = (-mouse_y) + 300;

        
        let x = ((2.0 * mouse_x) / 1080.0) - 1.0;
        let y = 1.0 - ((2.0 * mouse_y) / 600.0);
        let mouse_view = vec4(x, y, -1, 1);


        // projection matrix
           let projection_matrix = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);;
        
        // eye matrix
           let eye_matrix = Mat4.look_at(vec3(0, 10, 50), vec3(0, 8, 0), vec3(0, 1, 0));

        // convert: (doesn't work yet)
        let ray_eye = Mat4.inverse(projection_matrix).times(mouse_view);
        ray_eye = vec4(ray_eye.xy, -1, 0);

        let ray_world = (Mat4.inverse(eye_matrix).times(ray_eye));
        //ray_world = ray_world.normalize();

        
        let world_point = Mat4.inverse(eye_matrix).times(Mat4.inverse(projection_matrix).times(mouse_view));
        //console.log(eye_matrix);

        console.log(mouse_view);
        
        //draw a ray 
        this.shapes.ray.draw(context, program_state, model_transform, this.materials.ray, "LINES");

    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.initial_camera_location);
        }

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
        

        

       
    
        // makes up a preliminary scene
        // will clean it up when we implement mouse picking
        let score = 0;

//DRAW RANGE FLOORS AND WALL ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        let floor_transform = model_transform.times(Mat4.scale(30, 0.3, 30));
        let wall_transform = model_transform.times(Mat4.translation(0, 10, -10, 1)).times(Mat4.scale(25, 30, 0.3));


            this.shapes.range.draw(context, program_state, floor_transform, this.materials.range1);

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

        
//DRAW TARGETS///////////////////////////////////////////////////////////////////////////////////////////////////////////
        const hover = 0.1*Math.sin(2*t);
        var index = 0;
        for(var j = 0; j < 3; j++){ // number of z planes consisting of targets
            for(var i = 0; i < 9; i++){ // number of targets along the y axis on a given z plane
                // draw all targets in target_list that aren't shot:
                if(!this.target_list[index].isShot){ 
                    // test if we are in level 2. if so, move target and slowly decrease its size until a certain point:
                    if(t > 10){ // adjust right side to control when game transitions from level 1 to level 2
                        if(this.target_list[index].x_location > 18 || this.target_list[index].x_location < -18)
                            this.target_list[index].move_right ^= true; // change direction of motion if needed
                        
                        if(this.target_list[index].move_right){
                            this.target_list[index].x_location += 0.03; // adjust right side to control how fast objects move
                        }
                        else{
                            this.target_list[index].x_location -= 0.03; // same as above
                        }

                        if(Target.SCALE_FACTOR > 0.5){ // adjust right side to control minimum size of targets
                            Target.SCALE_FACTOR -= 0.00001; // adjust right side to control how fast targets get smaller as time goes on
                        }
                            
                    }
                    let target_transform = model_transform.times(Mat4.translation(this.target_list[index].x_location, 2 + i * 3 + hover, -9 + j * 6))
                        .times(Mat4.scale(Target.SCALE_FACTOR, Target.SCALE_FACTOR, Target.SCALE_FACTOR));
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
        

        // tests behavior of targets after being shot:
//         if(t > 5 && t < 5.5)
//             this.target_list[0].shoot();

//         if(t > 11 && t < 11.5){
//             this.target_list[1].shoot();
//             this.target_list[2].shoot();
//             this.target_list[3].shoot();
//             this.target_list[4].shoot();
//             this.target_list[5].shoot();
//             this.target_list[6].shoot();
//             this.target_list[7].shoot();
//             this.target_list[8].shoot();
//         }

//         if(t > 20 && t < 20.5){
//             this.target_list[1].shoot();
//             this.target_list[2].shoot();
//             this.target_list[3].shoot();
//         }



//DISPLAY TIME/////////////////////////////////////////////////////////////////////////////////////////////////////
        let time = 30 - t;
        if (time >=0){
            time = time.toPrecision(4);
            let line = "Time: " + time.toString(); 
            this.shapes.text.set_string(line, context.context);
        }
        else{
            let line = "Final score: " + score.toString();
            this.shapes.text.set_string(line, context.context);
        }

            this.shapes.text.draw(context, program_state, model_transform.times(Mat4.translation(-8, 26, 0)), this.materials.text_image);


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



        this.shapes.gun.draw(context,program_state, model_transform_gun,this.materials.gun_material);




        //model_transform_gun = model_transform_gun.times(Mat4.translation(0, 0, 40)).times(Mat4.scale(1,1,150));

        //this.shapes.ray.draw(context, program_state, model_transform_gun, this.materials.ray, "LINES");


        //test target at origin, delete later

        
//         const once = {
//             once : true;
//         };

       // addEventListener('click', this.mouse_picking, once);
        var canvas = document.getElementById('main-canvas');
        canvas.addEventListener('click', () => {
            this.CLICK = true;
        });

        if (this.CLICK){
            let shoot = new Audio("assets/shoot.wav");
            shoot.play();
            console.log(shoot);
            model_transform_gun = model_transform_gun.times(Mat4.translation(0,0,3)).times(Mat4.scale(0.25,0.25,0))
            this.shapes.muzzle.draw(context,program_state, model_transform_gun,this.materials.muzzleFlash);
            this.mouse_picking(context, program_state, model_transform);
        }




    }
}




// shaders from assignment 3 

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

