using UnityEngine;
using System;
using System.Collections;

/// MouseLook rotates the transform based on the mouse delta.
/// Minimum and Maximum values can be used to constrain the possible rotation

/// To make an FPS style character:
/// - Create a capsule.
/// - Add the MouseLook script to the capsule.
///   -> Set the mouse look to use LookX. (You want to only turn character but not tilt it)
/// - Add FPSInputController script to the capsule
///   -> A CharacterMotor and a CharacterController component will be automatically added.

/// - Create a camera. Make the camera a child of the capsule. Reset it's transform.
/// - Add a MouseLook script to the camera.
///   -> Set the mouse look to use LookY. (You want the camera to tilt up and down like a head. The character already turns.)
[AddComponentMenu("Camera-Control/Mouse Look")]
public class MouseLook : MonoBehaviour {

	public enum RotationAxes { MouseXAndY = 0, MouseX = 1, MouseY = 2 }
	public RotationAxes axes = RotationAxes.MouseXAndY;
	public float sensitivityX = 15F;
	public float sensitivityY = 15F;
	public SkeletonWrapper sw;
	public EffectiveAreaWrapper eaw;
	public float minimumX = -360F;
	public float maximumX = 360F;

	public float minimumY = -60F;
	public float maximumY = 60F;

	float rotationY = 0F;
	float rotationX = 0F;
	[HideInInspector]
	public int player;
	//public PlayerLeaveWrapper pw;
	public GeometryWrapper gw;
	private int nAngleKinect;
	
	private const int SKELETON_POSITION_HIP_CENTER = 0;
	private const int SKELETON_POSITION_SPINE = 1;
	private const int SKELETON_POSITION_SHOULDER_CENTER = 2;
	private const int SKELETON_POSITION_HEAD = 3;
	private const int SKELETON_POSITION_SHOULDER_LEFT = 4;
	private const int SKELETON_POSITION_ELBOW_LEFT = 5;
	private const int SKELETON_POSITION_WRIST_LEFT = 6;
	private const int SKELETON_POSITION_HAND_LEFT = 7;
	private const int SKELETON_POSITION_SHOULDER_RIGHT = 8;
	private const int SKELETON_POSITION_ELBOW_RIGHT = 9;
	private const int SKELETON_POSITION_WRIST_RIGHT = 10;
	private const int SKELETON_POSITION_HAND_RIGHT = 11;
	private const int SKELETON_POSITION_HIP_LEFT = 12;
	private const int SKELETON_POSITION_KNEE_LEFT = 13;
	private const int SKELETON_POSITION_ANKLE_LEFT = 14;
	private const int SKELETON_POSITION_FOOT_LEFT = 15;
	private const int SKELETON_POSITION_HIP_RIGHT = 16;
	private const int SKELETON_POSITION_KNEE_RIGHT = 17;
	private const int SKELETON_POSITION_ANKLE_RIGHT = 18;
	private const int SKELETON_POSITION_FOOT_RIGHT = 19;
	
	private const float fSpineYMin = 0.6F;
	private const float fSpineYMax = 1.0F;
	private const int nAddition = 1;
	private const int nAngleShoulder = 30;

	void Update ()
	{
		
		if(eaw != null)
		{
			player = eaw.nPlayerSon;
			//player =0;
			if(player ==-1)
			{
				return;
			}
		}
		else
		{
			return;
		}
		if(sw!=null){
			if(sw.pollSkeleton())
			{
				//Leave
				//Debug.Log(sw.bonePos[0, 1]		.z);

					//sw.bonePos[player,SKELETON_POSITION_HAND_LEFT].y > sw.bonePos[player,SKELETON_POSITION_ELBOW_LEFT].y)
				Vector3 vecDirLeft = new Vector3();
				vecDirLeft.Set(sw.bonePos[player,SKELETON_POSITION_HIP_LEFT].x - sw.bonePos[player,SKELETON_POSITION_HIP_RIGHT].x,
							   sw.bonePos[player,SKELETON_POSITION_HIP_LEFT].y - sw.bonePos[player,SKELETON_POSITION_HIP_RIGHT].y,
								sw.bonePos[player,SKELETON_POSITION_HIP_LEFT].z - sw.bonePos[player,SKELETON_POSITION_HIP_RIGHT].z);
				vecDirLeft = gw.geo_VecUnit(vecDirLeft);
				double dblAngleLeft = gw.geo_2VectorAngle(Vector3.right, vecDirLeft);
				dblAngleLeft = dblAngleLeft * 180/ Math.PI;
				//Debug.Log(dblAngleLeft);
				bool blnA;
				bool blnB;
				bool blnC;
				bool binNB;
				blnA = (180 - dblAngleLeft)>nAngleShoulder;
				Debug.Log(blnA);
				blnB = (sw.bonePos[player,SKELETON_POSITION_HIP_LEFT].z - sw.bonePos[player,SKELETON_POSITION_HIP_RIGHT].z)>0.01;
				binNB = (sw.bonePos[player,SKELETON_POSITION_HIP_RIGHT].z - sw.bonePos[player,SKELETON_POSITION_HIP_LEFT].z)>0.01;
				//blnC = (sw.bonePos[player, SKELETON_POSITION_SPINE].z - 0.5) < 0;
				if( (blnA&binNB))
				{
					rotationX = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivityX;
					rotationX = rotationX - 1F;
					transform.localEulerAngles = new Vector3(-rotationY, rotationX, 0);
				}
				//sw.bonePos[player,SKELETON_POSITION_HAND_RIGHT].y > sw.bonePos[player,SKELETON_POSITION_ELBOW_RIGHT].y)
				if( (blnA&blnB))
				{
					rotationX = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivityX;
					rotationX = rotationX + 1F;
					transform.localEulerAngles = new Vector3(-rotationY, rotationX, 0);
				}
				/*
				if(sw.bonePos[player,SKELETON_POSITION_HAND_LEFT].y > sw.bonePos[player,SKELETON_POSITION_WRIST_LEFT].y &
				   (sw.bonePos[player, SKELETON_POSITION_SPINE].z - 0.5) < 0)
				{
					rotationX = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivityX;
					rotationX = rotationX - 1F;
					transform.localEulerAngles = new Vector3(-rotationY, rotationX, 0);
				}
				//sw.bonePos[player,SKELETON_POSITION_HAND_RIGHT].y > sw.bonePos[player,SKELETON_POSITION_ELBOW_RIGHT].y)
				if(sw.bonePos[player,SKELETON_POSITION_HAND_RIGHT].y > sw.bonePos[player,SKELETON_POSITION_WRIST_RIGHT].y &
					(sw.bonePos[player, SKELETON_POSITION_SPINE].z - 0.5) < 0)
				   
				{
					rotationX = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * sensitivityX;
					rotationX = rotationX + 1F;
					transform.localEulerAngles = new Vector3(-rotationY, rotationX, 0);
				}
				//*/
			}
			
		}
	}
	
	void Start ()
	{
		// Make the rigid body not change rotation
		nAngleKinect = 0;
		if (rigidbody)
			rigidbody.freezeRotation = true;
	}
}