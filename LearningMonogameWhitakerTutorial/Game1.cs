using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using Microsoft.Xna.Framework.Audio;

namespace LearningMonogameWhitakerTutorial
{
    public class Game1 : Game
    {
        private GraphicsDeviceManager graphics;
        private SpriteBatch spriteBatch;
        private List<SoundEffect> soundEffects;
        private Texture2D background;
        private Texture2D shuttle;
        private Texture2D earth;
        private Texture2D smileyWalk;
        private Texture2D line;
        private SpriteFont font;

        private Texture2D blue;
        private Texture2D green;
        private Texture2D red;

        private AnimatedSprite animatedSprite;
        private int score = 0;
        private float angle = 0;

        // Variables to be used when moving red, green and blue in a circle
        private float blueAngle = 0;
        private float greenAngle = 0;
        private float redAngle = 0;

        private float blueSpeed = 0.025f;
        private float greenSpeed = 0.017f;
        private float redSpeed = 0.022f;

        private float distance = 100; // Radius of circle sprites will travel around

        // End: Variables to be used when moving red, green and blue in a circle

        public Game1()
        {
            graphics = new GraphicsDeviceManager(this);
            Content.RootDirectory = "Content";
            IsMouseVisible = true;
            soundEffects = new List<SoundEffect>();
        }

        protected override void Initialize()
        {
            // TODO: Add your initialization logic here
            line = new Texture2D(graphics.GraphicsDevice, 1, 1, false, SurfaceFormat.Color); // Can't be initialized in constructor, because GraphicsDevice is null there
            line.SetData(new[] { Color.White });
            base.Initialize();
        }

        protected override void LoadContent()
        {
            spriteBatch = new SpriteBatch(GraphicsDevice);

            // TODO: use this.Content to load your game content here
            background = Content.Load<Texture2D>("stars");
            shuttle = Content.Load<Texture2D>("shuttle");
            earth = Content.Load<Texture2D>("earth");
            font = Content.Load<SpriteFont>("Score");
            smileyWalk = Content.Load<Texture2D>("SmileyWalk");
            animatedSprite = new AnimatedSprite(smileyWalk, 4, 4);
            blue = Content.Load<Texture2D>("blue");
            green = Content.Load<Texture2D>("green");
            red = Content.Load<Texture2D>("red");

            soundEffects.Add(Content.Load<SoundEffect>("StegasaurusGrowl"));
            soundEffects[0].Play(); // See: https://gamefromscratch.com/monogame-tutorial-audio/ for audio tutorial and how to change  volume and loop sound
        }

        protected override void Update(GameTime gameTime)
        {
            if (GamePad.GetState(PlayerIndex.One).Buttons.Back == ButtonState.Pressed || Keyboard.GetState().IsKeyDown(Keys.Escape))
                Exit();

            // TODO: Add your update logic here
            score++;
            angle += 0.01f;

            animatedSprite.Update();

            blueAngle += blueSpeed;
            greenAngle += greenSpeed;
            redAngle += redSpeed;

            base.Update(gameTime);
        }

        protected override void Draw(GameTime gameTime)
        {
            Vector2 location = new Vector2(400, 240);
            Rectangle sourceRectangle = new Rectangle(0, 0, shuttle.Width, shuttle.Height);
            Vector2 origin = new Vector2(shuttle.Width / 2, shuttle.Height);  // This is the point of the image we rotate around.  In this case the middle of the bottom

            GraphicsDevice.Clear(Color.CornflowerBlue);

            spriteBatch.Begin();
            spriteBatch.Draw(background, new Rectangle(0, 0, 800, 480), Color.White);
            spriteBatch.Draw(earth, new Vector2(400, 240), Color.White);
            //_spriteBatch.Draw(_shuttle, new Vector2(450, 240), Color.White); // Static shuttle on screen
            spriteBatch.Draw(shuttle, location, sourceRectangle, Color.White, angle, origin, 1.0f, SpriteEffects.None, 1);  // Rotate shuttle, Note: Color.White means no tint color 1.0f is scale
            spriteBatch.DrawString(font, "Score: " + score, new Vector2(100, 100), Color.White);

            spriteBatch.Draw(line, new Rectangle(100, 100, 500, 1), null, Color.White, (float)Math.PI / 4, new Vector2(0, 0), SpriteEffects.None, 0);
            spriteBatch.End();

            animatedSprite.Draw(spriteBatch, new Vector2(400, 200));

            Vector2 bluePosition = new Vector2(
                (float)Math.Cos(blueAngle) * distance,
                (float)Math.Sin(blueAngle) * distance);
            Vector2 greenPosition = new Vector2(
                            (float)Math.Cos(greenAngle) * distance,
                            (float)Math.Sin(greenAngle) * distance);
            Vector2 redPosition = new Vector2(
                            (float)Math.Cos(redAngle) * distance,
                            (float)Math.Sin(redAngle) * distance);

            Vector2 center = new Vector2(300, 140);

            // Draw red, green and blue sprites with additive blending
            spriteBatch.Begin(SpriteSortMode.Immediate, BlendState.Additive);
            spriteBatch.Draw(blue, center + bluePosition, Color.White);
            spriteBatch.Draw(green, center + greenPosition, Color.White);
            spriteBatch.Draw(red, center + redPosition, Color.White);
            spriteBatch.End();

            base.Draw(gameTime);
        }
    }
}
