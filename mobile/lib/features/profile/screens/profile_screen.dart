import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../../core/constants/app_colors.dart';
import '../../../shared/models/user_model.dart';
import '../data/users_repository.dart';
import 'add_employee_screen.dart';

class ProfileScreen extends StatefulWidget {
  final UserModel user;
  const ProfileScreen({super.key, required this.user});
  @override State<ProfileScreen> createState()=>_ProfileScreenState();
}
class _ProfileScreenState extends State<ProfileScreen>{
  final repo=UsersRepository(); List<UserModel> employees=const[]; bool loading=false;
  @override void initState(){super.initState();if(widget.user.isOwner)load();}
  Future<void> load()async{setState(()=>loading=true);try{final u=await repo.getUsers();if(mounted)setState(()=>employees=u.where((x)=>x.role=='employee').toList());}catch(_){}finally{if(mounted)setState(()=>loading=false);}}
  Future<void> add()async{final ok=await Navigator.push<bool>(context,MaterialPageRoute(builder:(_)=>AddEmployeeScreen(pharmacyName:widget.user.pharmacyName)));if(ok==true)load();}
  @override Widget build(BuildContext context){final initial=widget.user.name.trim().isEmpty?'?':widget.user.name.trim()[0].toUpperCase();return Scaffold(
    backgroundColor:AppColors.background,appBar:AppBar(title:const Text('Profile')),
    body:RefreshIndicator(onRefresh:load,child:ListView(padding:const EdgeInsets.all(20),children:[
      Container(padding:const EdgeInsets.all(20),decoration:BoxDecoration(color:AppColors.surface,borderRadius:BorderRadius.circular(18),border:Border.all(color:AppColors.border)),child:Row(children:[
        CircleAvatar(radius:30,backgroundColor:AppColors.chipGrey,child:Text(initial,style:const TextStyle(color:AppColors.primary,fontSize:22,fontWeight:FontWeight.w800))),const SizedBox(width:14),
        Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(widget.user.name,style:const TextStyle(fontSize:18,fontWeight:FontWeight.w800)),const SizedBox(height:4),Text(widget.user.email,style:const TextStyle(color:AppColors.textGrey)),const SizedBox(height:4),Text(widget.user.isOwner?'Pharmacy Owner':'Pharmacy Employee',style:const TextStyle(color:AppColors.primary,fontWeight:FontWeight.w700,fontSize:12))]))])),
      const SizedBox(height:14),_Info(icon:Iconsax.shop,title:'Pharmacy',value:widget.user.pharmacyName),_Info(icon:Iconsax.call,title:'Phone',value:widget.user.phone),
      if(widget.user.isOwner)...[
        const SizedBox(height:12),Row(mainAxisAlignment:MainAxisAlignment.spaceBetween,children:[const Text('Team',style:TextStyle(fontSize:16,fontWeight:FontWeight.w800)),TextButton.icon(onPressed:add,icon:const Icon(Iconsax.user_add,size:18),label:const Text('Add Employee'))]),
        if(loading)const Center(child:Padding(padding:EdgeInsets.all(20),child:CircularProgressIndicator())) else if(employees.isEmpty)_Empty(onAdd:add) else ...employees.map((e)=>Container(margin:const EdgeInsets.only(bottom:10),padding:const EdgeInsets.all(14),decoration:BoxDecoration(color:AppColors.surface,borderRadius:BorderRadius.circular(14),border:Border.all(color:AppColors.border)),child:Row(children:[const CircleAvatar(backgroundColor:AppColors.chipGrey,child:Icon(Iconsax.profile_2user,color:AppColors.primary)),const SizedBox(width:12),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(e.name,style:const TextStyle(fontWeight:FontWeight.w700)),const SizedBox(height:3),Text(e.email,style:const TextStyle(color:AppColors.textGrey,fontSize:12))]))]))),
      ],
    ])));
  }
}
class _Info extends StatelessWidget{final IconData icon;final String title,value;const _Info({required this.icon,required this.title,required this.value});@override Widget build(BuildContext c)=>Container(margin:const EdgeInsets.only(bottom:10),padding:const EdgeInsets.all(14),decoration:BoxDecoration(color:AppColors.surface,borderRadius:BorderRadius.circular(14),border:Border.all(color:AppColors.border)),child:Row(children:[Icon(icon,color:AppColors.primary),const SizedBox(width:12),Expanded(child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[Text(title,style:const TextStyle(fontSize:11.5,color:AppColors.textGrey)),const SizedBox(height:2),Text(value.isEmpty?'—':value,style:const TextStyle(fontWeight:FontWeight.w700))]))]));}
class _Empty extends StatelessWidget{final VoidCallback onAdd;const _Empty({required this.onAdd});@override Widget build(BuildContext c)=>Container(padding:const EdgeInsets.all(18),decoration:BoxDecoration(color:AppColors.surface,borderRadius:BorderRadius.circular(14),border:Border.all(color:AppColors.border)),child:Column(children:[const Icon(Iconsax.profile_2user,size:34,color:AppColors.textGrey),const SizedBox(height:8),const Text('No employees yet',style:TextStyle(fontWeight:FontWeight.w700)),const SizedBox(height:4),const Text('Add your first team member.',style:TextStyle(color:AppColors.textGrey)),const SizedBox(height:12),OutlinedButton(onPressed:onAdd,child:const Text('Add Employee'))]));}
