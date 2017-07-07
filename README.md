# pid-sim
Super simple simulator for demonstrating PID.

This website simulates a basic model of a DC motor driving a winch with a weight attached to it.
Gravity pulls the weight down, and the motor's voltage is determined by the output of a PID loop for the weight's height.

Adjust kp, ki, and kd as well as setpoint to see how the system behaves.

Anti-windup determines whether the error is integrated while the motor is turning at full power (+/- 12V).
When anti-windup is on, the error is not integrated during this time to keep the integral term of the PID loop from causing an overshoot.
When anti-windup is off, the error is integrated on every step, regardless of the PID loop's output.
