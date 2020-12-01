import {defs, tiny} from './examples/common.js';
import {Shape_From_File} from './examples/obj-file-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

//code from assignment 2 for drawing cubes
class Cube extends Shape {
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
}

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

class Target{

};

export class ShootingRange extends Scene {
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            range: new Cube,
            target: new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1),

            cube: new defs.Cube(), 
            text: new Text_Line(35),
            gun: new Shape_From_File("assets/m4a1.obj"),

            ray: new Line,
        };

        const texture = new defs.Textured_Phong(1);
        


        // *** Materials
        this.materials = {
            range1: new Material(new defs.Phong_Shader(),
                {ambient: .5, diffusivity: .6, color: color(0, 0, 0, 1)}),
            range2: new Material(new defs.Phong_Shader(),
                {ambient: .7, diffusivity: .6, color: color(1, 1, 1, 1)}),
            target: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: .6, specularity: 1.0, color: color(1, 0, 0, 1)}), 
            text_image: new Material(texture, {
                ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")}),
            projectile: new Material(new defs.Phong_Shader(),
                {ambient: 1, color: hex_color("#f8d43d")}),
            gun_material: new Material(new defs.Phong_Shader, 
                {color: color(0, 0, 0, 1), ambient: .6, diffusivity: .5, specularity: .5}),
            
            ray: new Material(new defs.Basic_Shader()), 
                
               
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
        const light_position = vec4(0, 30, 60, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        let model_transform = Mat4.identity();

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);
        

        
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        
        

       
    
    // makes up a preliminary scene
    // will clean it up when we implement mouse picking 
        let score = 0;

        //shooting range floor and walls
        let floor_transform = model_transform.times(Mat4.scale(30, 0.3, 30));
        let wall_transform = model_transform.times(Mat4.translation(0, 10, -10, 1)).times(Mat4.scale(25, 30, 0.3));


        this.shapes.range.draw(context, program_state, floor_transform, this.materials.range2);

        this.shapes.range.draw(context, program_state, wall_transform, this.materials.range2);


        let wall_transform_2 = model_transform.times(Mat4.translation(20, 10, -10)).times(Mat4.scale(0.3, 30, 50));

        this.shapes.range.draw(context, program_state, wall_transform_2, this.materials.range2);

        wall_transform_2 = wall_transform_2.times(Mat4.scale(10/3, 1/30, 1/50)).times(Mat4.translation(-40,0,0))
                                            .times(Mat4.scale(0.3, 30, 50));

        this.shapes.range.draw(context, program_state, wall_transform_2, this.materials.range2);






        
        //targets
        const hover = 0.1*Math.sin(2*t);
        let target1 = model_transform.times(Mat4.translation(-15, 9 + hover, -9));
        let target2 = model_transform.times(Mat4.translation(0, 9 + hover, -9));
        let target3 = model_transform.times(Mat4.translation(15, 9 + hover, -9));




        const periodic = Math.cos(Math.PI*t/5);

        let color_changer = color(0.5-(0.5*periodic),0,0.5+(0.5*periodic),1);
        let color_changer_2 = color(0.5+(0.5*periodic),0,0.5-(0.5*periodic),1);
        let color_changer_3 = color(0.5-(0.5*periodic),0.5+(0.5*periodic),0.5-(0.5*periodic),1);

        this.shapes.target.draw(context, program_state, target1, this.materials.target.override({color: color_changer}));
        this.shapes.target.draw(context, program_state, target2, this.materials.target.override({color: color_changer_2}));
        this.shapes.target.draw(context, program_state, target3, this.materials.target.override({color: color_changer_3}));

     // display time
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


        // draw the gun
        let model_transform_gun = model_transform.times(Mat4.translation(0, 8.8, 47.5)).times(Mat4.rotation(Math.PI, 0, 1, 0)).times(Mat4.rotation(0.04, 1, 0, 0));



         //console.log(defs.canvas_mouse_pos);

         let mouse_x = 0;
         let mouse_y = 0;

         if(defs.canvas_mouse_pos) {
             mouse_x = defs.canvas_mouse_pos.dot(vec(1, 0));
             mouse_y = defs.canvas_mouse_pos.dot(vec(0, 1));
         }

         let x = (2*mouse_x)/1080-1;
         let y = 1 - (2*mouse_y)/600;
         let z = -1;

         let ray_nds = vec3(x,y,z);

         let ray_clip = ray_nds.to4(true);

         let ray_eye = ray_clip.times(Mat4.inverse(program_state.projection_transform));

         ray_eye[2] = -1;
         ray_eye[3] = 0;

         let ray_wor = ray_eye.times(program_state.camera_inverse);

         ray_wor.normalize();

        console.log(mouse_x + ',' + mouse_y);
        console.log(ray_wor.dot(vec4(1,0,0,0)) + ',' + ray_clip.dot(vec4(0,1,0,0)) + ',' + ray_clip.dot(vec4(0,0,1,0)));


        model_transform_gun = model_transform_gun.times(Mat4.translation(3*mouse_x/540,0,0))

        model_transform_gun = model_transform_gun.times(Mat4.rotation(1.53*Math.atan(-mouse_x/1000), 0,1,0));


        model_transform_gun = model_transform_gun.times(Mat4.rotation(1.59*Math.atan((mouse_y-8.8)/1000), 1,0,0));



        this.shapes.gun.draw(context,program_state, model_transform_gun,this.materials.gun_material);


        //model_transform_gun = model_transform_gun.times(Mat4.translation(0, 0, 40)).times(Mat4.scale(1,1,150));

        //this.shapes.ray.draw(context, program_state, model_transform_gun, this.materials.ray, "LINES");


        //test target at origin, delete later
        //this.shapes.target.draw(context, program_state, model_transform, this.materials.target.override({color: color_changer_3}));
        
//         const once = {
//             once : true;
//         };

       // addEventListener('click', this.mouse_picking, once);
        var canvas = document.getElementById('main-canvas');
        canvas.addEventListener('click', () => {
            this.CLICK = true;
        });

        if (this.CLICK){
            this.mouse_picking(context, program_state, model_transform);
        }



    }
}




// shaders from assignment 3 

class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

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
        varying vec4 Vertex_color;
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
                vec3 N = normalize( mat3( model_transform ) * normal / squared_scale);
                vec3 vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;

                // Compute an initial (ambient) color:
                vec4 color = vec4( shape_color.xyz * ambient, shape_color.w );
                // Compute the final color with contributions from lights:
                color.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                Vertex_color = color;
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){                                                           
                // Compute an initial (ambient) color:
                gl_FragColor = Vertex_color;
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

class Ring_Shader extends Shader {
    update_GPU(context, gpu_addresses, graphics_state, model_transform, material) {
        // update_GPU():  Defining how to synchronize our JavaScript's variables to the GPU's:
        const [P, C, M] = [graphics_state.projection_transform, graphics_state.camera_inverse, model_transform],
            PCM = P.times(C).times(M);
        //pass model_transform and projection_comera_model_transform into graphics card 
        context.uniformMatrix4fv(gpu_addresses.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
            Matrix.flatten_2D_to_1D(PCM.transposed()));
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return `
        precision mediump float;
        varying vec4 point_position;
        varying vec4 center;
        `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
        
        void main(){
            // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
            //global point coordinates:
                point_position = model_transform * vec4(position, 1.0);
            // planet center global point coordinates: 
                center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
         
        }`;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
        return this.shared_glsl_code() + `
        void main(){
            // Compute an initial (ambient) color:
                 float ambient = 3.0*length(point_position.xyz);
                 gl_FragColor = vec4(0.6, 0.4, 0.0, 1.0) * ambient;
        }`;
    }
}

